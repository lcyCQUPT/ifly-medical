# Task: 前端页面级路由懒加载 — fix-04

## 📌 Context（上下文）

> fix-03 成功将 ChatPanel 从主包拆分，但 fix-03 代码评审（2026-04-14）指出构建产物中 `index-[hash].js` 和 `profile-[hash].js` 仍超过 500 KB 告警线，原因是 App.tsx 中 4 个主页面（ProfilePage、VisitsPage、MedicationsPage、MetricsPage）仍以静态 import 打包进主 chunk。本任务延续 Code Splitting 策略，对路由级页面组件实施懒加载，进一步削减首屏加载体积。

- **所属模块**: frontend / routing
- **触发原因**: fix-03 代码评审（2026-04-14）性能优化建议
- **依赖任务**: fix-03（已完成）
- **影响范围**:
  - `packages/frontend/src/App.tsx` — 将 4 个页面改为 `React.lazy` 动态导入，添加 `Suspense` 包裹

---

## 🎯 Objective（目标）

将 `App.tsx` 中四个主页面组件改为懒加载，使每个页面打包为独立 chunk，用户访问哪个页面才加载对应代码。

---

## 🏗️ Architecture Decision（架构决策）

- **采用方案**：在 `App.tsx` 中用 `React.lazy` 替换四个主页面的静态 import，在 `MainLayout` 的 `<Routes>` 外层添加 `<Suspense>` 包裹
  - Vite 会自动将每个 `import()` 打包为独立 chunk
  - `AuthPage`（登录页）**不做懒加载**：它是未登录用户的首屏，体积小，懒加载无收益且会增加登录等待感
- **放弃方案**：对 `AuthPage` 也懒加载（无必要，首屏性能反而下降）
- **核心约束**:
  - 不修改任何页面组件内部代码
  - 不修改路由路径和 `PrivateRoute` 逻辑
  - 不引入新依赖（`lazy`、`Suspense` 为 React 内置）
  - Suspense `fallback` 使用已引入的 Ant Design `<Spin size="large" />` 居中展示，与现有加载态视觉一致

---

## 📁 File Map（文件地图）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 修改 | `packages/frontend/src/App.tsx` | 4 个页面改 lazy import，Routes 外添加 Suspense |

---

## ⚙️ Implementation Steps（实现步骤）

**Step 1**：`App.tsx` — 替换静态 import 为 `React.lazy`

- 找到文件顶部的静态页面 import（第 11-14 行）：
  ```typescript
  import { VisitsPage } from './pages/VisitsPage';
  import { MedicationsPage } from './pages/MedicationsPage';
  import { MetricsPage } from './pages/MetricsPage';
  import { ProfilePage } from './pages/ProfilePage';
  ```
- 替换为动态导入（注意各页面均为具名导出，需用 `.then` 适配）：
  ```typescript
  import { lazy } from 'react';

  const VisitsPage = lazy(() =>
    import('./pages/VisitsPage').then((m) => ({ default: m.VisitsPage }))
  );
  const MedicationsPage = lazy(() =>
    import('./pages/MedicationsPage').then((m) => ({ default: m.MedicationsPage }))
  );
  const MetricsPage = lazy(() =>
    import('./pages/MetricsPage').then((m) => ({ default: m.MetricsPage }))
  );
  const ProfilePage = lazy(() =>
    import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
  );
  ```
- 同时将顶部 `import type { ReactElement } from 'react'` 中补充 `Suspense`：
  ```typescript
  import { lazy, Suspense, type ReactElement } from 'react';
  ```
- 难度：简单

**Step 2**：`App.tsx` — 在 `MainLayout` 中用 `<Suspense>` 包裹 `<Routes>`

- 找到 `MainLayout` 函数中的 `<Content>` 内的 `<Routes>` 块（第 75-82 行）：
  ```tsx
  <Content style={{ background: '#f5f5f5' }}>
    <Routes>
      ...
    </Routes>
  </Content>
  ```
- 在 `<Routes>` 外层添加 `<Suspense>`：
  ```tsx
  <Content style={{ background: '#f5f5f5' }}>
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
        </div>
      }
    >
      <Routes>
        ...
      </Routes>
    </Suspense>
  </Content>
  ```
- 注意：`Spin` 已在文件顶部从 `antd` 引入，无需新增 import
- 难度：简单

---

## 🔌 Interface Contract（接口契约）

本任务不涉及 API 或组件接口变更，纯打包策略调整。用户行为不变，切换页面时首次加载会短暂显示 Spin，之后走浏览器缓存。

---

## ✅ Acceptance Criteria（验收标准）

- [ ] `pnpm --filter frontend build` 构建成功，无 TypeScript 编译错误
- [ ] 构建产物中出现 4 个独立的页面 chunk 文件（如 `VisitsPage-[hash].js` 等）
- [ ] 主包 `index-[hash].js` 体积相比 fix-03 后有进一步下降
- [ ] 四个主页面导航均正常，切换时显示 Spin 加载态后正确渲染内容
- [ ] 登录页（`/login`）功能不受影响
- [ ] `PrivateRoute` 鉴权逻辑不受影响（未登录跳转 `/login` 仍正常）
- [ ] 没有未清理的多余代码

---

## 🚫 Constraints & Anti-patterns（禁止项）

- ❌ 不要对 `AuthPage` 做懒加载
- ❌ 不要修改任何页面组件（`VisitsPage`、`MedicationsPage`、`MetricsPage`、`ProfilePage`）的内部代码
- ❌ 不要修改路由路径或 `PrivateRoute` 逻辑
- ❌ 不要引入任何新的 npm 依赖
- ❌ 不要修改后端任何文件

---

## 📎 Reference（参考资料）

- 入口文件：`packages/frontend/src/App.tsx`
- 参考实现：`packages/frontend/src/components/ChatWidget.tsx`（fix-03 已有 lazy 导入示例）
- React.lazy 文档：https://react.dev/reference/react/lazy
- 架构规范：`AgentDocs/Project.md`
