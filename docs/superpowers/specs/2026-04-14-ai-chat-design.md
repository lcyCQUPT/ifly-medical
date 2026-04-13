# AI 健康问答功能设计

**日期：** 2026-04-14  
**状态：** 已批准

---

## 1. 功能概述

在现有医疗健康应用中新增 AI 健康问答模块。用户可随时唤起右下角悬浮气泡与 AI 助手对话，历史会话可查看和切换，支持"附上档案"将个人基础健康信息带入对话。

**AI 定位：** 健康建议助手，仅供参考，不构成医疗诊断。  
**AI 服务：** 阿里百炼，OpenAI 兼容接口。

---

## 2. 界面设计

### 2.1 整体布局

采用**悬浮气泡**方案：右下角固定一个圆形 🤖 按钮，点击展开聊天面板，可在任意页面使用。聊天面板不影响底层页面。

### 2.2 面板结构

```
┌─────────────────────────────────┐
│  AI 健康助手          [新对话] [×] │  ← 顶部标题栏
├──────────┬──────────────────────┤
│ 会话列表  │  消息气泡区            │
│ (可滚动)  │  (最新消息在底部)      │
│          ├──────────────────────┤
│          │ [📎 附上档案]  输入框  │
│          │               [发送]  │
└──────────┴──────────────────────┘
```

- 左侧 1/3：历史会话列表，显示最新消息预览和时间，可删除单条会话
- 右侧 2/3：当前会话消息区 + 底部输入区
- 面板尺寸：宽约 600px，高约 500px，固定在右下角

### 2.3 会话管理

- **新建对话**：点击"新对话"按钮，前端生成 `crypto.randomUUID()` 作为 `sessionId`
- **切换会话**：点击左侧列表项，加载该会话消息
- **删除会话**：会话列表项提供删除按钮；删除当前会话后重置为空状态

### 2.4 附上档案

点击"📎 附上档案"按钮：
1. 前端调用 `GET /api/profile` 获取个人档案
2. 将基础字段（姓名、血型、过敏史、慢性病）拼接为文本前缀
3. 随本条消息一并发送

拼接格式：
```
[我的健康档案]
姓名：xxx  血型：xxx  过敏史：xxx  慢性病：xxx

<用户实际输入的问题>
```

---

## 3. 后端设计

### 3.1 新增文件

| 文件 | 职责 |
|------|------|
| `packages/backend/src/services/chat.service.ts` | 业务逻辑：历史拼接、调百炼、存库 |
| `packages/backend/src/controllers/chat.controller.ts` | HTTP 请求处理 |
| `packages/backend/src/routes/chat.routes.ts` | 路由注册 |

### 3.2 API 接口（已在 `docs/api.md` 定义）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/chat` | 发送消息，返回 AI 回复 + sessionId |
| GET | `/api/chat/history` | 获取会话列表（按最新消息时间排序） |
| GET | `/api/chat/history/:sessionId` | 获取某会话全部消息 |
| DELETE | `/api/chat/history/:sessionId` | 删除某会话 |

### 3.3 `chat.service.ts` 函数签名

```ts
sendMessage(sessionId: string, userContent: string): Promise<{ reply: string; sessionId: string }>
getSessions(): Promise<Session[]>
getSessionMessages(sessionId: string): Promise<ChatMessage[]>
deleteSession(sessionId: string): Promise<void>
```

### 3.4 `sendMessage` 内部逻辑

1. 从 `ChatHistory` 读取该 `sessionId` 历史，按 `createdAt` 升序
2. 构建 messages 数组：
   ```
   [
     { role: "system", content: "你是专业的健康助手，根据用户信息给出健康建议，仅供参考，不构成医疗诊断。" },
     ...历史消息（role: user/assistant）,
     { role: "user", content: userContent }
   ]
   ```
3. 调百炼 OpenAI 兼容接口：`POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`，使用 `fetch`，不引入新 SDK
4. 将用户消息和 AI 回复各存一条 `ChatHistory` 记录
5. 返回 `{ reply, sessionId }`

### 3.5 百炼 API 配置

- 接口：OpenAI 兼容，`POST /compatible-mode/v1/chat/completions`
- 鉴权：`Authorization: Bearer <AI_API_KEY>`
- 模型：`qwen-plus`（默认，以百炼文档为准）
- 响应：阻塞式（非流式），等完整回复

### 3.6 环境变量

用户需在 `.env` 中配置：

```
AI_API_KEY=<百炼 API Key>
```

### 3.7 `index.ts` 修改

```ts
import chatRouter from './routes/chat.routes';
app.use('/api/chat', chatRouter);
```

---

## 4. 前端设计

### 4.1 新增文件

| 文件 | 职责 |
|------|------|
| `packages/frontend/src/api/chat.ts` | React Query hooks |
| `packages/frontend/src/components/ChatWidget.tsx` | 浮动按钮 + 展开/收起状态管理 |
| `packages/frontend/src/components/ChatPanel.tsx` | 面板主体（会话列表 + 消息区 + 输入区） |

### 4.2 `api/chat.ts` hooks

```ts
useSessions()                          // GET /api/chat/history
useSessionMessages(sessionId?: string) // GET /api/chat/history/:sessionId（sessionId 有值才 enabled）
useSendMessage()                       // POST /api/chat mutation
useDeleteSession()                     // DELETE /api/chat/history/:sessionId mutation
```

### 4.3 `ChatWidget.tsx`

- `useState<boolean>` 管理展开/收起
- `useState<string | null>` 管理 `currentSessionId`
- `open=false`：渲染右下角圆形按钮
- `open=true`：渲染 `<ChatPanel>`，传入 `currentSessionId` 和 `setCurrentSessionId`

### 4.4 `ChatPanel.tsx`

- 接收 `currentSessionId`、`onSessionChange`、`onClose` props
- 左侧会话列表：使用 `useSessions()`，点击切换，删除后 invalidate
- 右侧消息区：使用 `useSessionMessages(currentSessionId)`，消息列表自动滚动到底部
- 底部输入区：受控 input + "附上档案"按钮 + 发送按钮
- 发送调用 `useSendMessage()`，`onSuccess` 时 invalidate `useSessionMessages` 和 `useSessions`

### 4.5 `App.tsx` 修改

在 `</Layout>` 前插入 `<ChatWidget />`：

```tsx
import { ChatWidget } from './components/ChatWidget';
// ...
      </Layout>
      <ChatWidget />
    </QueryClientProvider>
```

---

## 5. 数据流

```
用户输入（可选拼接档案）
  → useSendMessage POST /api/chat { sessionId, content }
  → 后端读历史 → 拼 messages → 调百炼
  → 存 ChatHistory（user + assistant 各一条）
  → 返回 { reply, sessionId }
  → onSuccess: invalidate sessionMessages + sessions
  → UI 自动刷新
```

---

## 6. 数据模型

复用现有 `ChatHistory` 表（已在 `schema.prisma` 定义）：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int, PK | |
| sessionId | String | 同一会话分组（前端 UUID） |
| role | String | `user` / `assistant` |
| content | String | 消息正文 |
| createdAt | DateTime | 时间 |

`getSessions()` 通过 `GROUP BY sessionId` 取最新消息预览：使用 Prisma `groupBy` 或原始查询。

---

## 7. 约束

- 不引入新 npm 包（百炼调用用 `fetch`，UUID 用 `crypto.randomUUID()`）
- 历史消息不做截断（个人应用，数据量小）
- AI 回复为阻塞式，非流式
- `ChatHistory` 表无需迁移，已存在于 schema
