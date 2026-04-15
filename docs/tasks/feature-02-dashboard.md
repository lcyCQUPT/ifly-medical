# Task: 综合健康仪表板 — feature-02

## 📌 Context（上下文）

> 项目四大业务模块（档案、就诊、用药、健康指标）已独立完整，但用户每次使用需逐个进入模块才能了解健康全貌。本任务新增「健康概览」仪表板页面，将各模块关键信息聚合展示，让用户打开应用即可一目了然掌握当前健康状态。
>
> 本文档已经过 Codex 审查，所有高中风险问题均已修正。执行阶段发现事件时序问题，已采用 Bridge 变量方案修正。

- **所属模块**: frontend / dashboard（新增）
- **触发原因**: 产品体验优化，提升各模块数据可达性
- **依赖任务**: 无（所有依赖的 API 和 hook 均已存在）
- **影响范围**:
  - `packages/frontend/src/pages/DashboardPage.tsx` — 新建仪表板页面
  - `packages/frontend/src/App.tsx` — 添加路由、菜单项、统一默认跳转
  - `packages/frontend/src/components/ChatWidget.tsx` — 监听 open-chat 事件
  - `packages/frontend/src/components/ChatPanel.tsx` — 挂载时读取 Bridge 变量填充输入框、改用共享常量
  - `packages/frontend/src/constants/chat.ts` — 新建，提取 QUICK_PROMPTS 共享常量

---

## 🎯 Objective（目标）

新增健康概览页，聚合展示当前用药、最近就诊、各指标最新状态和 AI 问答快捷入口，使用户无需逐模块查看即可掌握健康全貌。

---

## 🏗️ Architecture Decision（架构决策）

- **采用方案**：新建 `DashboardPage.tsx`，全部复用现有 API hooks，不新增后端接口
- **AI 快捷入口**：`CustomEvent` + 模块级 Bridge 变量双轨方案，不修改 ChatPanel Props 接口
  - Dashboard 点击快捷问题 → 写入 `pendingPromptStore.value = prompt`，同时 dispatch `open-chat` 事件
  - `ChatWidget` 监听 `open-chat`：`setOpen(true)`、`setCurrentSessionId(null)`（强制新建会话），不负责填充
  - `ChatPanel` 在两处读取 Bridge 变量并填充输入框（见 Step 2），完全不依赖事件到达时序
  - **解决懒加载时序问题**：ChatPanel 挂载时同步读取变量，无论网络加载快慢均可靠填充
  - **ChatPanel Props 接口不变**
- **指标卡片方案**：取最近 50 条指标，客户端按类型去重（每种类型保留最新一条），展示各类型当前状态（正常/异常色差区分），解决「前 N 条过滤可能遗漏异常」的数据盲区问题
- **QUICK_PROMPTS**：提取到 `src/constants/chat.ts` 共享常量，`ChatPanel` 和 `DashboardPage` 同时引用，避免后续文案漂移
- **默认落地页**：全部统一跳转 `/dashboard`，包括 `/`、已登录访问 `/login`、未知路径 fallback
- **放弃方案**：新增后端聚合接口（成本高）；`initialInput` prop + 回调（Props 接口有破坏性变更）
- **核心约束**:
  - 不修改后端任何代码
  - 不修改 `packages/shared` 任何文件
  - 不引入新 npm 依赖
  - ChatPanel Props 接口保持不变

---

## 📁 File Map（文件地图）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `packages/frontend/src/constants/chat.ts` | 提取 QUICK_PROMPTS 为共享常量 |
| 新建 | `packages/frontend/src/pages/DashboardPage.tsx` | 仪表板主页面 |
| 修改 | `packages/frontend/src/components/ChatPanel.tsx` | 挂载/currentSessionId 变化时读取 Bridge 填充输入框，改用共享 QUICK_PROMPTS |
| 修改 | `packages/frontend/src/components/ChatWidget.tsx` | 监听 open-chat 事件，打开面板并新建会话 |
| 修改 | `packages/frontend/src/App.tsx` | 新增路由、菜单项、统一所有默认跳转为 /dashboard |

---

## ⚙️ Implementation Steps（实现步骤）

**Step 1**：新建 `src/constants/chat.ts` — 共享常量 + Bridge 变量

```typescript
// 快捷问题常量，DashboardPage 和 ChatPanel 共同引用
export const QUICK_PROMPTS = [
  '血压偏高，日常饮食有哪些注意事项？',
  '最近睡眠质量差，有什么改善建议？',
  '我的慢性病用药需要注意什么？',
] as const;

// Bridge 变量：ChatWidget 写入，ChatPanel 挂载时读取
// 用模块级变量而非 React 状态，避免事件时序依赖（解决 lazy 加载场景下事件丢失问题）
export const pendingPromptStore: { value: string | null } = { value: null };
```

- 难度：简单

---

**Step 2**：修改 `ChatPanel.tsx` — 改用共享常量 + 读取 Bridge 变量

- 将文件顶部的 `QUICK_PROMPTS` 常量定义删除，改为从共享常量导入：
  ```typescript
  import { QUICK_PROMPTS, pendingPromptStore } from '../constants/chat';
  ```
- 在组件内添加**两处** `useEffect` 读取 Bridge 变量：

  ```typescript
  // 处理场景 1：ChatPanel 首次挂载时（lazy 加载完成后），读取 Bridge 填充输入
  useEffect(() => {
    if (pendingPromptStore.value) {
      setInput(pendingPromptStore.value);
      pendingPromptStore.value = null;
    }
  }, []); // 仅在挂载时执行一次

  // 处理场景 2：ChatPanel 已挂载，ChatWidget 重置 currentSessionId=null 触发新会话
  useEffect(() => {
    if (currentSessionId === null && pendingPromptStore.value) {
      setInput(pendingPromptStore.value);
      pendingPromptStore.value = null;
    }
  }, [currentSessionId]);
  ```

- **Props 接口不变**，不新增任何 prop
- 难度：简单

---

**Step 3**：修改 `ChatWidget.tsx` — 监听 open-chat 事件，写入 Bridge 变量

- 在文件顶部导入 Bridge 变量：
  ```typescript
  import { pendingPromptStore } from '../constants/chat';
  ```
- 在组件内添加 `useEffect` 监听 `open-chat` 事件：
  ```typescript
  useEffect(() => {
    const handler = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail;
      if (prompt) {
        pendingPromptStore.value = prompt; // 写入 Bridge，供 ChatPanel 挂载时读取
      }
      setOpen(true);
      setCurrentSessionId(null); // 强制新建会话
    };
    window.addEventListener('open-chat', handler);
    return () => window.removeEventListener('open-chat', handler);
  }, []);
  ```
- 难度：简单

---

**Step 4**：新建 `DashboardPage.tsx` — 仪表板主页面

页面整体为两行两列响应式卡片（`<Row gutter={[16,16]}`），每列 `xs=24 lg=12`。

**卡片 1 — 当前用药**
- 调用 `useMedications(1, 5, true)` 获取活跃用药
- 加载中：卡片内显示 `<Spin />`
- 加载失败：显示 `<Alert type="error" message="加载失败" />`
- 空状态：`「暂无正在服用的药物」`
- 用 `List` 展示：药品名称（加粗）、剂量 + 频率（次要色）
- 卡片右上角「查看全部」→ `navigate('/medications')`

**卡片 2 — 最近就诊**
- 调用 `useVisits(1, 3)` 获取最近 3 条就诊记录
- 加载中：`<Spin />`；加载失败：`<Alert type="error" />`
- 空状态：`「暂无就诊记录」`
- 用 `List` 展示：就诊日期、医院 + 科室、诊断（截断超过 30 字符部分加省略号）
- 卡片右上角「查看全部」→ `navigate('/visits')`

**卡片 3 — 健康指标快照**
- 调用 `useMetrics(1, 50)` 获取最近 50 条记录
- 客户端按 `type` 去重，每种类型保留第一条（后端按 `recordedAt` 倒序，第一条即最新）
- 加载中：`<Spin />`；加载失败：`<Alert type="error" />`
- 空状态：`「暂无健康指标记录」`
- 用 `List` 展示每种类型的最新值：
  - 指标类型标签（`HealthMetricLabels[type]`）
  - 数值 + 单位
  - `status === 'abnormal'` → `<Tag color="error">异常</Tag>`，行文字色 `#cf1322`
  - `status === 'normal'` → `<Tag color="success">正常</Tag>`
- 卡片右上角「查看全部」→ `navigate('/metrics')`

**卡片 4 — AI 健康问答**
- 展示说明文字：`「点击问题，AI 健康助手为您解答」`
- 用 `Space direction="vertical" style={{ width: '100%' }}` 排列 3 个 `Button`（`type="default"`, `block`）
- 按钮文案来自 `QUICK_PROMPTS`（从共享常量导入）
- 点击：`window.dispatchEvent(new CustomEvent('open-chat', { detail: prompt }))`
- 无 loading/error 态（纯静态）

- 难度：中等

---

**Step 5**：修改 `App.tsx` — 路由、菜单、跳转统一

- 顶部 import 补充：
  ```typescript
  import { DashboardOutlined } from '@ant-design/icons';
  import { lazy } from 'react'; // 已有，确认包含 lazy
  ```
- `DashboardPage` 使用懒加载（与其他页面一致）：
  ```typescript
  const DashboardPage = lazy(() =>
    import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
  );
  ```
- `PageKey` 类型补充 `'dashboard'`：
  ```typescript
  type PageKey = 'dashboard' | 'profile' | 'visits' | 'medications' | 'metrics';
  ```
- `menuItems` 数组**最前面**插入：
  ```typescript
  { key: 'dashboard', label: '健康概览', icon: <DashboardOutlined /> },
  ```
- `getSelectedMenuKey` 函数最前面添加：
  ```typescript
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  ```
- `MainLayout` 的 `<Routes>` 中添加：
  ```tsx
  <Route path="/dashboard" element={<PrivateRoute element={<DashboardPage />} />} />
  ```
- 统一所有默认跳转为 `/dashboard`（共 3 处）：
  ```tsx
  // 1. 根路径
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  // 2. 已登录访问 /login（在 App 组件的 Routes 中）
  <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
  // 3. 未知路径 fallback
  <Route path="*" element={<Navigate to="/dashboard' replace />} />
  ```
- 难度：简单

---

## 🔌 Interface Contract（接口契约）

本任务不新增后端接口，全部使用现有 API：

| API | 用途 | 参数 |
|-----|------|------|
| `GET /api/medications?page=1&limit=5&isActive=true` | 当前活跃用药 | 已支持 |
| `GET /api/visits?page=1&limit=3` | 最近就诊 | 已支持 |
| `GET /api/metrics?page=1&limit=50` | 各指标最新状态（客户端去重） | 已支持 |

**AI 快捷入口完整数据流：**
```typescript
// Step 1 — DashboardPage 点击快捷问题
pendingPromptStore.value = prompt;                                    // 写入 Bridge
window.dispatchEvent(new CustomEvent('open-chat', { detail: prompt }));

// Step 2 — ChatWidget 收到事件
pendingPromptStore.value = prompt;  // 再次确保写入（事件 detail 同步）
setOpen(true);
setCurrentSessionId(null);          // 强制新建会话

// Step 3a — ChatPanel 首次挂载（lazy 加载场景）
// useEffect([]) 执行，读取 pendingPromptStore.value，调用 setInput(prompt)

// Step 3b — ChatPanel 已挂载（面板曾经打开过）
// useEffect([currentSessionId]) 监听到 null，读取 pendingPromptStore.value，调用 setInput(prompt)
```

---

## ✅ Acceptance Criteria（验收标准）

- [ ] 登录后默认落地页为 `/dashboard`
- [ ] 已登录访问 `/login` 跳转 `/dashboard`；未知路径 fallback 也跳转 `/dashboard`
- [ ] 左侧菜单顶部新增「健康概览」入口，当前页高亮正确
- [ ] 当前用药卡片：有活跃用药时正确展示，无时显示空状态；加载/错误状态正常
- [ ] 最近就诊卡片：展示最新 3 条，无时显示空状态；加载/错误状态正常
- [ ] 健康指标卡片：每种类型展示最新一条，异常显示红色 Tag，正常显示绿色 Tag；加载/错误状态正常
- [ ] 各卡片「查看全部」跳转到对应模块页面
- [ ] AI 问答卡片：点击快捷问题后 ChatWidget 打开，输入框填入对应文本，且为全新会话（无历史上下文）
- [ ] `QUICK_PROMPTS` 在 Dashboard 和 ChatPanel 中来自同一共享常量
- [ ] 其他页面（档案、就诊、用药、指标）功能不受影响
- [ ] TypeScript 编译无错误（`pnpm --filter frontend build` 通过）
- [ ] 没有未清理的多余代码

---

## 🚫 Constraints & Anti-patterns（禁止项）

- ❌ 不要修改后端任何文件
- ❌ 不要修改 `packages/shared` 任何文件
- ❌ 不要引入任何新 npm 依赖
- ❌ 不要修改 ChatPanel 的 Props 接口（`currentSessionId`、`onSessionChange`、`onClose` 三项不变，不新增）
- ❌ 不要在 Dashboard AI 卡片中直接修改 ChatWidget 的状态（必须通过 CustomEvent）
- ❌ 快捷问题点击后不要自动发送，只填充输入框
- ❌ 不要对 AuthPage 做懒加载

---

## 📎 Reference（参考资料）

- 路由入口：`packages/frontend/src/App.tsx`
- ChatWidget：`packages/frontend/src/components/ChatWidget.tsx`
- ChatPanel：`packages/frontend/src/components/ChatPanel.tsx`
- 参考页面：`packages/frontend/src/pages/MetricsPage.tsx`（卡片 loading/error 参考）
- API hooks：`packages/frontend/src/api/medications.ts`、`visits.ts`、`metrics.ts`
- 架构规范：`AgentDocs/Project.md`
