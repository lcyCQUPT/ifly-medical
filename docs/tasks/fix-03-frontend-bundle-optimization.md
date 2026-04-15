# Task: 前端 Bundle 体积优化 — fix-03

## 📌 Context（上下文）

> feature-01 引入 `react-markdown` + `remark-gfm` 后，前端生产构建主包约 1961.45 kB，超出 Vite 默认的 500 kB 告警阈值。ChatPanel 是浮动聊天组件，仅在用户主动点击时加载，但当前与主包一起打包，造成首屏不必要的体积负担。本任务通过 Code Splitting 将 ChatPanel 从主包中分离，减少首屏加载体积。

- **所属模块**: frontend / chat
- **触发原因**: feature-01 代码评审（2026-04-14）性能优化建议
- **依赖任务**: fix-02（已完成）
- **影响范围**:
  - `packages/frontend/src/App.tsx` — 改用动态导入 ChatWidget
  - `packages/frontend/src/components/ChatWidget.tsx` — 改用动态导入 ChatPanel

---

## 🎯 Objective（目标）

通过 `React.lazy` + `Suspense` 将 ChatPanel（含 react-markdown）从主包拆分为独立 chunk，降低首屏加载体积。

---

## 🏗️ Architecture Decision（架构决策）

- **采用方案**：在 `ChatWidget.tsx` 中对 `ChatPanel` 使用 `React.lazy` 动态导入；用 `<Suspense fallback={<Spin />}>` 包裹懒加载组件
  - Vite 会自动将 `ChatPanel`（及其依赖 `react-markdown`、`remark-gfm`）打包为独立 chunk
  - 用户首次点击聊天按钮时才触发加载，后续访问走浏览器缓存
- **放弃方案**：在 `App.tsx` 层对 `ChatWidget` 整体懒加载（粒度过粗，ChatWidget 本身很轻量，无需懒加载）
- **核心约束**:
  - 不修改 `ChatPanel` 的 Props 接口
  - 不修改后端任何代码
  - 不引入新依赖（`React.lazy` 和 `Suspense` 均为 React 内置）
  - Suspense fallback 使用已引入的 Ant Design `Spin` 组件，保持 UI 一致性

---

## 📁 File Map（文件地图）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `packages/frontend/src/components/ChatWidget.tsx` | 将 `import ChatPanel` 改为 `React.lazy` 动态导入，并添加 `Suspense` 包裹 |

---

## ⚙️ Implementation Steps（实现步骤）

**Step 1**：`ChatWidget.tsx` — 改用懒加载导入 ChatPanel

- 找到文件顶部的静态导入：
  ```typescript
  import { ChatPanel } from './ChatPanel';
  ```
- 替换为动态导入：
  ```typescript
  import { lazy, Suspense } from 'react';
  import { Spin } from 'antd';

  const ChatPanel = lazy(() =>
    import('./ChatPanel').then((m) => ({ default: m.ChatPanel }))
  );
  ```
  注意：`ChatPanel` 是具名导出（named export）而非默认导出，需要用 `.then((m) => ({ default: m.ChatPanel }))` 适配 `React.lazy` 要求的默认导出格式。

- 找到 JSX 中渲染 `<ChatPanel ... />` 的位置，用 `<Suspense>` 包裹：
  ```tsx
  <Suspense fallback={<Spin style={{ display: 'block', margin: '40px auto' }} />}>
    <ChatPanel
      currentSessionId={currentSessionId}
      onSessionChange={setCurrentSessionId}
      onClose={() => setOpen(false)}
    />
  </Suspense>
  ```
- 难度：简单

---

## 🔌 Interface Contract（接口契约）

本任务不涉及 API 变更，纯前端打包策略调整。用户交互行为不变：点击聊天按钮 → 首次加载时显示 Spin → ChatPanel 出现。

---

## ✅ Acceptance Criteria（验收标准）

- [ ] `pnpm --filter frontend build` 构建成功，无 TypeScript 编译错误
- [ ] 构建产物中出现以 `ChatPanel` 或 hash 命名的独立 chunk 文件（`.js`）
- [ ] 主包（`index-[hash].js`）体积相比改前有明显下降
- [ ] 首次点击聊天按钮时，ChatPanel 能正常加载并显示（Spin → 内容）
- [ ] ChatPanel 的所有功能不受影响：发送消息、Markdown 渲染、会话切换、快捷引导按钮均正常
- [ ] 没有未清理的多余代码

---

## 🚫 Constraints & Anti-patterns（禁止项）

- ❌ 不要修改 `ChatPanel.tsx` 的任何代码
- ❌ 不要修改 `ChatPanel` 的 Props 接口
- ❌ 不要对 `ChatWidget` 本身也做懒加载（它只是一个轻量浮动按钮）
- ❌ 不要引入任何新的 npm 依赖
- ❌ 不要修改后端任何文件
- ❌ 不要使用 `dangerouslySetInnerHTML`

---

## 📎 Reference（参考资料）

- 入口文件：`packages/frontend/src/components/ChatWidget.tsx`
- 目标组件：`packages/frontend/src/components/ChatPanel.tsx`
- React.lazy 文档：https://react.dev/reference/react/lazy
- 架构规范：`AgentDocs/Project.md`
