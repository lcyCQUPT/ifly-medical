# Task: 后端三项安全与健壮性优化 — fix-02

## 📌 Context（上下文）

> 三项独立的后端优化，均由代码审查（2026-04-14）发现，改动量小但对系统安全性和可维护性有实质意义。本任务合并处理以降低上下文切换成本。

- **所属模块**: chat（AI 聊天）/ visit（就诊记录）
- **触发原因**: 代码安全审查建议
- **依赖任务**: 无
- **影响范围**:
  - `packages/backend/src/services/chat.service.ts` — 添加 sessionId 归属校验
  - `packages/backend/src/controllers/chat.controller.ts` — 细化错误码
  - `packages/backend/src/services/visit.service.ts` — 修复附件删除操作顺序

---

## 🎯 Objective（目标）

修复后端三处已知缺陷：防止跨用户 sessionId 注入、AI 错误码语义化、附件删除孤儿文件风险消除。

---

## 🏗️ Architecture Decision（架构决策）

### Item 1：Chat Session ID 归属校验
- **采用方案**：在 `sendMessage` 写入用户消息前，查询该 `sessionId` 是否已存在属于**其他用户**的记录；若存在则拒绝请求
- **放弃方案**：服务端生成 UUID（会改变 API 契约，成本高）
- **核心约束**：
  - 不改变 `sendMessage` 函数签名
  - 全新 sessionId（无任何历史记录）视为合法，直接放行

### Item 2：AI 错误码细化
- **采用方案**：在 `postMessage` 的 catch 块中，先判断是否为已知 `AppError` 直接重新抛出；再识别 OpenAI SDK 的 status 字段，对 429（配额超限）单独处理；其余未知错误降级为 500
- **放弃方案**：统一包装为 500（现状，丢失了 service 层已有的语义错误）
- **核心约束**：
  - 不修改 `chat.service.ts` 的 AppError(503) 逻辑，它已经正确
  - 只在 controller 层做识别和转换

### Item 3：附件删除操作顺序
- **采用方案**：将 `fs.unlink` 改为 `await fs.promises.unlink()`，并调整到数据库更新**之前**执行；ENOENT（文件不存在）视为正常情况静默忽略；其他错误 console.warn 后仍继续执行 DB 更新（不阻塞用户操作）
- **放弃方案**：软删除机制（成本高，当前规模不必要）
- **核心约束**：
  - 不引入新依赖，使用 Node.js 内置 `fs.promises`
  - 不改变 `removeAttachment` 函数签名
  - ENOENT 错误不打印 warn，避免日志噪音

---

## 📁 File Map（文件地图）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `packages/backend/src/services/chat.service.ts` | `sendMessage` 函数内添加 sessionId 归属校验 |
| 修改 | `packages/backend/src/controllers/chat.controller.ts` | `postMessage` catch 块细化错误码处理 |
| 修改 | `packages/backend/src/services/visit.service.ts` | `removeAttachment` 调整文件删除顺序，改用 `fs.promises` |

---

## ⚙️ Implementation Steps（实现步骤）

**Step 1**：`chat.service.ts` — sendMessage 添加 sessionId 归属校验

- 位置：`sendMessage` 函数，第 63 行 `prisma.chatHistory.create` **之前**
- 插入以下逻辑：
  ```typescript
  // 校验 sessionId 未被其他用户占用
  const collision = await prisma.chatHistory.findFirst({
    where: { sessionId, NOT: { userId } },
  });
  if (collision) {
    throw new AppError(400, 'SESSION_ID_CONFLICT', 'sessionId 已被其他用户使用');
  }
  ```
- 难度：简单

**Step 2**：`chat.controller.ts` — postMessage 细化错误码

- 位置：`postMessage` 函数的 catch 块（当前第 14-16 行）
- 将现有 catch 块替换为：
  ```typescript
  } catch (err) {
    if (err instanceof AppError) throw err;
    const status = (err as any)?.status;
    if (status === 429) {
      throw new AppError(429, 'AI_QUOTA_EXCEEDED', 'AI 配额已用尽，请稍后重试');
    }
    throw new AppError(500, 'AI_SERVICE_UNAVAILABLE', 'AI 服务暂时不可用，请稍后重试');
  }
  ```
- 注意：`AppError` 已在文件顶部引入，无需新增 import
- 难度：简单

**Step 3**：`visit.service.ts` — removeAttachment 调整删除顺序

- 位置：`removeAttachment` 函数（第 86-105 行）
- 当前逻辑顺序：① 更新 DB → ② 异步 `fs.unlink`（火后不管）
- 修改为：① 先用 `fs.promises.unlink` 删除物理文件 → ② 再更新 DB
- 具体改法：
  ```typescript
  // 在 prisma.visit.update 之前插入：
  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, '../../uploads/visits', String(visitId), safeFilename);
  try {
    await fs.promises.unlink(filePath);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.warn('[visit.service] Failed to delete file:', filePath, err.message);
    }
  }

  // 然后执行 DB 更新（移除原来的 filePath 和 fs.unlink 调用）
  const updated = toDto(
    await prisma.visit.update({ where: { id: visitId }, data: { attachments: JSON.stringify(filtered) } })
  );
  return updated;
  ```
- 注意：`fs` 已在文件顶部引入（当前为 `import fs from 'fs'`），`fs.promises` 无需额外引入
- 删除原来的 `const safeFilename`、`const filePath`、`fs.unlink(...)` 三行（避免重复）
- 难度：简单

---

## 🔌 Interface Contract（接口契约）

本任务不新增或变更 API 接口，仅改变错误响应的 HTTP 状态码语义：

| 场景 | 改前 | 改后 |
|------|------|------|
| AI API Key 未配置 | 500（被 controller 覆盖） | 503（service 已有，controller 修复后透传）|
| AI 配额超限 | 500 | 429 |
| sessionId 被其他用户占用 | 无校验，静默写入 | 400 SESSION_ID_CONFLICT |
| 其他 AI 服务错误 | 500 | 500（不变）|

---

## ✅ Acceptance Criteria（验收标准）

- [ ] `sendMessage` 在写入消息前，若 sessionId 已属于其他用户，返回 400
- [ ] 全新 sessionId（无任何历史记录）可正常使用，不受归属校验影响
- [ ] `postMessage` catch 块：`AppError` 能正确透传（503 不再被覆盖为 500）
- [ ] OpenAI 返回 429 时，接口响应 HTTP 429 而非 500
- [ ] `removeAttachment` 中 `fs.promises.unlink` 在 DB 更新之前执行
- [ ] 文件不存在（ENOENT）时，附件删除操作正常完成，无错误日志
- [ ] 没有未清理的多余代码（原 `fs.unlink` 回调已删除）
- [ ] TypeScript 编译无错误（`pnpm --filter backend build` 通过）

---

## 🚫 Constraints & Anti-patterns（禁止项）

- ❌ 不要修改数据库 Schema 或 Prisma 迁移文件
- ❌ 不要改变任何函数的签名（`sendMessage`、`removeAttachment`、`postMessage`）
- ❌ 不要引入任何新的 npm 依赖
- ❌ 不要修改 `packages/shared` 任何文件
- ❌ 不要修改前端任何文件
- ❌ ENOENT 错误不要打印 console.warn，静默处理即可

---

## 📎 Reference（参考资料）

- chat.service.ts：`packages/backend/src/services/chat.service.ts`（sendMessage 第 54-93 行）
- chat.controller.ts：`packages/backend/src/controllers/chat.controller.ts`（postMessage 第 8-17 行）
- visit.service.ts：`packages/backend/src/services/visit.service.ts`（removeAttachment 第 86-105 行）
- AppError 定义：`packages/backend/src/lib/app-error.ts`
- 架构规范：`AgentDocs/Project.md`
