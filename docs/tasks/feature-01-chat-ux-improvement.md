# Task: AI 聊天体验完善 — feature-01

## 📌 Context（上下文）

> ChatPanel 基础架构已完整，但 AI 回复以纯文本展示导致 Markdown 格式丢失、发送失败无任何反馈、新用户不知道如何开始对话。本任务通过三项改进提升聊天体验，使 AI 健康助手功能达到可用的产品级质量。

- **所属模块**: frontend / chat（AI 健康问答）
- **触发原因**: 产品体验优化
- **依赖任务**: 无
- **影响范围**:
  - `packages/frontend/src/components/ChatPanel.tsx` — 主要改动文件
  - `packages/frontend/src/api/chat.ts` — 添加 onError 回调
  - `packages/frontend/package.json` — 新增依赖

---

## 🎯 Objective（目标）

完善 ChatPanel 的三项体验缺口：AI 回复支持 Markdown 渲染、发送失败给出明确错误提示、无会话时展示快捷引导问题。

---

## 🏗️ Architecture Decision（架构决策）

- **Markdown 渲染方案**: 采用 `react-markdown` + `remark-gfm`
  - 渲染为 React 虚拟 DOM，无 XSS 风险
  - 仅对 `role === 'assistant'` 的气泡应用，用户消息保持 `whiteSpace: pre-wrap`
  - 放弃手写解析（维护成本高，格式支持有限）
- **错误提示方案**: 使用 Ant Design 的 `App.useApp().message.error()`
  - 不新增依赖，与项目现有组件体系一致
- **引导问题方案**: 在 `!currentSessionId` 的空状态区域渲染快捷按钮
  - 点击后调用 `setInput()` 填充输入框，不自动发送
- **核心约束**:
  - 不修改后端任何代码
  - 不修改 `shared` 包
  - 不改变 ChatPanel 的 Props 接口

---

## 📁 File Map（文件地图）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `packages/frontend/package.json` | 新增 `react-markdown`、`remark-gfm` 依赖 |
| 修改 | `packages/frontend/src/api/chat.ts` | `useSendMessage` 添加 `onError` 回调 |
| 修改 | `packages/frontend/src/components/ChatPanel.tsx` | 三项 UI 改进 |

---

## ⚙️ Implementation Steps（实现步骤）

**Step 1**: 安装新依赖

- 在仓库根目录执行：

  ```bash
  pnpm --filter frontend add react-markdown remark-gfm
  ```

- 难度：简单

**Step 2**: `useSendMessage` 添加错误回调（`packages/frontend/src/api/chat.ts`）

- 在 `useMutation` 的配置中增加 `onError` 选项，错误信息通过 Ant Design `message.error()` 展示
- 注意：需要使用 `App.useApp()` 获取 message 实例，或直接使用静态 `message` 方法（Ant Design v5 推荐前者，但静态方法更简单，可用静态方式）
- 错误文案示例：`'消息发送失败，请稍后重试'`
- 难度：简单

**Step 3**: ChatPanel — AI 回复 Markdown 渲染（`packages/frontend/src/components/ChatPanel.tsx`）

- 在文件顶部引入：

  ```typescript
  import ReactMarkdown from 'react-markdown';
  import remarkGfm from 'remark-gfm';
  ```

- 找到消息气泡渲染区域（当前用 `msg.content` 纯文本渲染），将 `role === 'assistant'` 的气泡内容替换为：

  ```tsx
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {msg.content}
  </ReactMarkdown>
  ```

- `role === 'user'` 的气泡保持原有纯文本渲染（`whiteSpace: 'pre-wrap'`）
- 为 Markdown 容器添加基础样式，使其与气泡背景色协调：
  - `p` 元素：`margin: 0`（避免默认外边距撑大气泡）
  - `ul/ol`：`paddingLeft: 16px, margin: '4px 0'`
  - `code`（行内代码）：`background: rgba(0,0,0,.06), borderRadius: 3px, padding: '0 4px'`
  - 样式可通过 `components` prop 传入，或使用 CSS 全局覆盖
- 难度：中等

**Step 4**: ChatPanel — 新对话快捷引导（`packages/frontend/src/components/ChatPanel.tsx`）

- 找到 `!currentSessionId` 时渲染的 `<Empty>` 组件，替换为包含快捷引导的区域：
  - 保留提示文字："选择历史会话或点击「新对话」开始"
  - 在文字下方展示 3 个 `Button` (type="default", size="small")，点击后调用 `setInput(问题文本)` 并调用 `handleNewSession()`
  - 推荐问题（可直接写死）：
    1. `"血压偏高，日常饮食有哪些注意事项？"`
    2. `"最近睡眠质量差，有什么改善建议？"`
    3. `"我的慢性病用药需要注意什么？"`
- 难度：简单

---

## 🔌 Interface Contract（接口契约）

本任务不涉及后端 API 变更，所有改动均在前端 UI 层。

---

## ✅ Acceptance Criteria（验收标准）

- [ ] 安装 `react-markdown` 和 `remark-gfm` 后 `pnpm install` 无报错
- [ ] AI 回复中的 `**加粗**`、`- 列表`、`# 标题` 等格式正确渲染，不显示原始符号
- [ ] 用户消息气泡不受 Markdown 渲染影响，仍为纯文本展示
- [ ] 发送消息失败时，页面顶部/合适位置出现错误提示文字
- [ ] 未选中任何会话时，显示 3 个快捷引导按钮；点击后输入框填入对应问题文本并开启新会话
- [ ] 原有功能不受影响：发送、历史会话切换、删除会话、附加档案、加载状态均正常
- [ ] TypeScript 编译无错误（`pnpm --filter frontend build` 通过）
- [ ] 没有未清理的多余代码

---

## 🚫 Constraints & Anti-patterns（禁止项）

- ❌ 不要修改后端任何文件
- ❌ 不要修改 `packages/shared` 任何文件
- ❌ 不要改变 `ChatPanel` 的 Props 接口（`currentSessionId`、`onSessionChange`、`onClose`）
- ❌ 不要对用户消息气泡使用 Markdown 渲染
- ❌ 不要使用 `dangerouslySetInnerHTML` 渲染 AI 回复
- ❌ 不要引入除 `react-markdown`、`remark-gfm` 以外的新依赖
- ❌ 快捷引导按钮点击后不要自动发送，只填充输入框

---

## 📎 Reference（参考资料）

- 现有实现：`packages/frontend/src/components/ChatPanel.tsx`
- Chat API hooks：`packages/frontend/src/api/chat.ts`
- react-markdown 文档：<https://github.com/remarkjs/react-markdown>
- 架构规范：`AgentDocs/Project.md`
