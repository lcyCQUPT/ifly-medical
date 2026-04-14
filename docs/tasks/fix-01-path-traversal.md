# Task: 修复附件删除路径遍历漏洞 — SEC-01

## 📌 Context（上下文）

> 代码审查报告（2026-04-14）发现附件删除接口存在路径遍历安全漏洞。攻击者可以通过构造恶意 `filename`（如 `../../etc/passwd`）绕过预期目录，访问或删除服务器上任意文件，属于生产级安全风险，必须立即修复。

- **所属模块**: visit（就诊记录 / 附件管理）
- **触发原因**: 代码安全审查发现安全漏洞
- **依赖任务**: 无
- **影响范围**:
  - `packages/shared/src/schemas/visit.ts` — 增强 `filename` 字段校验
  - `packages/backend/src/services/visit.service.ts` — 服务层增加文件名净化

---

## 🎯 Objective（目标）

修复 `removeAttachment` 中的路径遍历漏洞，确保任何包含路径分隔符或 `..` 的 `filename` 都无法到达文件系统操作层。

---

## 🏗️ Architecture Decision（架构决策）

- **采用方案**: 双重防御 — Schema 层校验 + Service 层净化
  - **第一道防线**（Schema 层）：在 `attachmentParamsSchema` 的 `filename` 字段添加正则校验，禁止包含 `/`、`\`、`..` 等路径危险字符
  - **第二道防线**（Service 层）：在 `removeAttachment` 构造 `filePath` 前，使用 `path.basename(filename)` 获取安全的纯文件名
- **放弃方案**: 仅修复 Schema 层（单点防御，纵深不足）
- **核心约束**:
  - 不允许修改数据库 Schema
  - 不允许改变 `removeAttachment` 的函数签名
  - 不允许引入新的外部依赖

---

## 📁 File Map（文件地图）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `packages/shared/src/schemas/visit.ts` | `filename` 字段添加正则校验 |
| 修改 | `packages/backend/src/services/visit.service.ts` | 构造 `filePath` 前使用 `path.basename` 净化 |

---

## ⚙️ Implementation Steps（实现步骤）

**Step 1**: 修改 `packages/shared/src/schemas/visit.ts`

- 找到 `attachmentParamsSchema` 中的 `filename` 字段（第 22 行）
- 当前代码：`filename: z.string().min(1, '无效的文件名')`
- 修改为：添加 `.regex()` 校验，禁止包含 `/`、`\`、`..`
  ```typescript
  filename: z
    .string()
    .min(1, '无效的文件名')
    .regex(/^[^/\\]+$/, '文件名不得包含路径分隔符')
    .refine((v) => !v.includes('..'), '文件名不得包含路径遍历字符'),
  ```
- 难度：简单

**Step 2**: 修改 `packages/backend/src/services/visit.service.ts`

- 找到 `removeAttachment` 函数中第 97 行的 `filePath` 构造
- 当前代码：
  ```typescript
  const filePath = path.join(__dirname, '../../uploads/visits', String(visitId), filename);
  ```
- 修改为使用 `path.basename` 净化：
  ```typescript
  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, '../../uploads/visits', String(visitId), safeFilename);
  ```
- 难度：简单

---

## 🔌 Interface Contract（接口契约）

本次修复不改变 API 接口签名，仅加强输入校验。

- 合法 filename 示例：`report-2026.pdf`、`image_01.jpg`
- 非法 filename（将被 400 拒绝）：`../../etc/passwd`、`../secret.txt`、`folder/file.pdf`

---

## ✅ Acceptance Criteria（验收标准）

- [ ] `attachmentParamsSchema` 的 `filename` 字段已添加正则校验，禁止 `/`、`\`、`..`
- [ ] `visit.service.ts` 中 `removeAttachment` 使用 `path.basename` 净化文件名后再拼接路径
- [ ] 传入 `../../etc/passwd` 等路径遍历字符串时，接口返回 400 而非执行文件操作
- [ ] 合法的附件删除操作不受影响（功能回归正常）
- [ ] 没有未清理的多余代码
- [ ] TypeScript 编译无错误（`pnpm --filter backend build` 通过）

---

## 🚫 Constraints & Anti-patterns（禁止项）

- ❌ 不要修改数据库 Schema 或 Prisma 迁移文件
- ❌ 不要改变 `removeAttachment` 函数的签名
- ❌ 不要引入任何新的 npm 依赖
- ❌ 不要修改其他与本次漏洞无关的代码
- ❌ 不要删除现有的 `min(1)` 校验，应保留并叠加新校验

---

## 📎 Reference（参考资料）

- 漏洞位置：`packages/backend/src/services/visit.service.ts` 第 97 行
- Schema 位置：`packages/shared/src/schemas/visit.ts` 第 20-23 行
- 审查报告：`docs/reviews/2026-04-14-project-review.md`
