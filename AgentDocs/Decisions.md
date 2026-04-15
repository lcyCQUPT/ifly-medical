# 技术决策日志

> 记录项目中的关键技术决策，包括背景、选项、结论和理由。
> 目的：避免重复讨论已决策的问题，为后续决策提供上下文。
> 重要：只记录重要和重大决策，避免记录无意义的内容，保持内容精简
> 维护者：Claude Code
---

## 决策记录格式

```markdown
##  [决策标题]
**背景：** [为什么需要做这个决策]
**选项：**
- A. [方案] — [优缺点]
- B. [方案] — [优缺点]
**结论：** [选择了哪个方案]
**理由：** [为什么]
**审查：** [是否经过 Codex 审查，审查结论摘要]
**影响范围：** [哪些模块/文件/功能受影响]
```

---
<!-- 决策记录从这里开始 -->

## 附件删除路径遍历漏洞修复策略（fix-01）
**背景：** 2026-04-14 代码审查发现 `removeAttachment` 中 `filename` 未过滤路径分隔符，存在路径遍历安全漏洞
**选项：**
- A. 仅在 Schema 层（Zod）添加正则校验 — 简单，但单点防御
- B. 双重防御：Schema 层正则校验 + Service 层 `path.basename()` 净化 — 纵深防御，即使一层失效另一层兜底
**结论：** 采用方案 B
**理由：** 安全漏洞采用纵深防御原则，两道防线互补，成本低效果好
**审查：** 经 GEMINI CLI 评审通过（docs/reviews/fix-01-review.md）
**影响范围：** `packages/shared/src/schemas/visit.ts`、`packages/backend/src/services/visit.service.ts`

## Dashboard 与 ChatWidget 跨组件通信方案（feature-02）
**背景：** Dashboard 页面点击 AI 快捷问题需触发 ChatWidget 打开并填充输入框，但 ChatPanel 采用懒加载，事件触发时组件可能未挂载导致事件丢失
**选项：**
- A. Props 传递 — 需修改 ChatPanel Props 接口，破坏性变更
- B. 全局状态库（Zustand）— 引入新依赖，当前场景过重
- C. CustomEvent + Bridge 变量 — 零依赖，Bridge 变量（模块级单例）存储待填充内容，ChatPanel 挂载时同步读取，解决懒加载时序问题
**结论：** 采用方案 C
**理由：** 当前场景有限，轻量级方案务实可接受；Bridge 变量在闭包中存储，ChatPanel 挂载后通过 useEffect 读取并清空，不依赖事件到达时序
**审查：** 经 GEMINI CLI 评审通过（docs/reviews/feature-02-review.md）
**影响范围：** `packages/frontend/src/constants/chat.ts`（新建）、`ChatWidget.tsx`、`ChatPanel.tsx`、`DashboardPage.tsx`

## AI 设置与用户画像注入方案（feature-03）
**背景：** AI 健康问答功能不知道用户是谁，无法给出个性化建议；需让用户自主控制哪些档案字段可被 AI 使用
**选项：**
- A. 存在 Profile 表新增字段 — 职责变重，扩展性差
- B. 独立 AISettings 表 — 与 Profile 解耦，扩展性好
**结论：** 采用方案 B
**理由：** 独立表存储用户隐私偏好，职责清晰；Profile 不存在时跳过画像注入，对话正常进行；前端勾选字段但档案内容为空时显示弱提示
**审查：** 经 GEMINI CLI 评审通过（docs/reviews/feature-03-review.md）
**影响范围：** `packages/backend/prisma/schema.prisma`、`ai-settings.service.ts`（新建）、`chat.service.ts`（修改）、`AISettingsPage.tsx`（新建）