# Task: AI 设置页面与用户画像注入 — feature-03

## 📌 Context（上下文）

> 当前 AI 健康问答功能不知道用户是谁，无法给出个性化建议。本任务新增「AI 设置」功能，让用户自主选择哪些档案字段可被 AI 使用，并在对话时注入允许的字段到系统提示，实现个性化健康问答。
>
> 这是「个性化 AI 健康顾问」方向的第一阶段，后续阶段将扩展为主动关怀等功能。

- **所属模块**: backend / frontend / ai-settings（新增）
- **触发原因**: 产品方向调整，聚焦 AI 作为核心能力
- **依赖任务**: 无
- **影响范围**:
  - `packages/backend/prisma/schema.prisma` — 新增 AISettings 表
  - `packages/backend/src/services/ai-settings.service.ts` — 新建
  - `packages/backend/src/controllers/ai-settings.controller.ts` — 新建
  - `packages/backend/src/routes/ai-settings.routes.ts` — 新建
  - `packages/backend/src/services/chat.service.ts` — 修改 sendMessage，注入用户画像
  - `packages/backend/src/index.ts` — 注册新路由
  - `packages/shared/src/types/ai-settings.ts` — 新建类型定义
  - `packages/shared/src/schemas/ai-settings.ts` — 新建 Zod schema
  - `packages/shared/src/index.ts` — 导出新类型
  - `packages/frontend/src/pages/AISettingsPage.tsx` — 新建设置页面
  - `packages/frontend/src/api/ai-settings.ts` — 新建 API hooks
  - `packages/frontend/src/App.tsx` — 添加路由和菜单项

---

## 🎯 Objective（目标）

新增 AI 设置页面，用户可选择哪些档案字段（性别、年龄、血型、身高、体重、过敏史、慢性病史、姓名）可被 AI 使用；对话时根据设置注入允许的字段到 AI 系统提示，实现个性化健康问答。

---

## 🏗️ Architecture Decision（架构决策）

- **采用方案**：独立 `AISettings` 表存储用户配置，与 Profile 解耦
- **默认行为**：新用户默认全部字段开启（姓名除外）
- **系统提示构建**：在 `chat.service.ts` 的 `sendMessage` 中动态读取 Profile + AISettings，拼接用户画像到系统提示
- **Profile 不存在处理**：跳过画像注入，对话正常进行，不影响 AI 功能
- **前端弱提示**：用户勾选某字段但档案对应内容为空时，显示简短弱提示（如「档案中暂无此信息」）
- **放弃方案**：
  - 存在 Profile 表新增字段（职责变重，扩展性差）
  - 前端硬编码字段列表（不利于后续扩展）
- **核心约束**:
  - 不修改现有 Chat API 接口签名
  - 不修改 ChatPanel 组件
  - 用户未设置时使用默认配置

---

## 📁 File Map（文件地图）

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `packages/backend/prisma/migrations/xxx_add_ai_settings.sql` | 新增 AISettings 表 |
| 修改 | `packages/backend/prisma/schema.prisma` | 添加 AISettings model |
| 新建 | `packages/shared/src/types/ai-settings.ts` | 类型定义 |
| 新建 | `packages/shared/src/schemas/ai-settings.ts` | Zod schema |
| 修改 | `packages/shared/src/index.ts` | 导出新类型 |
| 新建 | `packages/backend/src/services/ai-settings.service.ts` | AI 设置服务层 |
| 新建 | `packages/backend/src/controllers/ai-settings.controller.ts` | AI 设置控制器 |
| 新建 | `packages/backend/src/routes/ai-settings.routes.ts` | AI 设置路由 |
| 修改 | `packages/backend/src/services/chat.service.ts` | 注入用户画像到系统提示 |
| 修改 | `packages/backend/src/index.ts` | 注册新路由 |
| 新建 | `packages/frontend/src/api/ai-settings.ts` | API hooks |
| 新建 | `packages/frontend/src/pages/AISettingsPage.tsx` | AI 设置页面（需同时获取 Profile 数据） |
| 修改 | `packages/frontend/src/App.tsx` | 添加路由和菜单项 |

---

## ⚙️ Implementation Steps（实现步骤）

**Step 1**：数据库 Schema 变更

在 `schema.prisma` 中新增 `AISettings` model：

```prisma
model AISettings {
  id                Int      @id @default(autoincrement())
  userId            Int      @unique
  includeGender     Boolean  @default(true)
  includeAge        Boolean  @default(true)
  includeBloodType  Boolean  @default(true)
  includeHeight     Boolean  @default(true)
  includeWeight     Boolean  @default(true)
  includeAllergies  Boolean  @default(true)
  includeChronic    Boolean  @default(true)
  includeName       Boolean  @default(false)
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

同时在 `User` model 中添加关联：
```prisma
model User {
  // ... 现有字段
  aiSettings        AISettings?
}
```

执行迁移：`pnpm --filter backend exec prisma migrate dev --name add_ai_settings`

- 难度：简单

---

**Step 2**：Shared 层类型与 Schema

新建 `packages/shared/src/types/ai-settings.ts`：

```typescript
export interface AISettings {
  id: number;
  includeGender: boolean;
  includeAge: boolean;
  includeBloodType: boolean;
  includeHeight: boolean;
  includeWeight: boolean;
  includeAllergies: boolean;
  includeChronic: boolean;
  includeName: boolean;
  updatedAt: string;
}

export type AISettingsUpdateInput = Partial<Omit<AISettings, 'id' | 'updatedAt'>>;
```

新建 `packages/shared/src/schemas/ai-settings.ts`：

```typescript
import { z } from 'zod';

export const aiSettingsUpdateSchema = z.object({
  includeGender: z.boolean().optional(),
  includeAge: z.boolean().optional(),
  includeBloodType: z.boolean().optional(),
  includeHeight: z.boolean().optional(),
  includeWeight: z.boolean().optional(),
  includeAllergies: z.boolean().optional(),
  includeChronic: z.boolean().optional(),
  includeName: z.boolean().optional(),
});
```

在 `packages/shared/src/index.ts` 中导出。

- 难度：简单

---

**Step 3**：后端 Service 层

新建 `packages/backend/src/services/ai-settings.service.ts`：

```typescript
import prisma from '../lib/prisma';
import type { AISettings, AISettingsUpdateInput } from '@ifly-medical/shared';

// 默认配置（全部开启，姓名关闭）
const DEFAULT_SETTINGS = {
  includeGender: true,
  includeAge: true,
  includeBloodType: true,
  includeHeight: true,
  includeWeight: true,
  includeAllergies: true,
  includeChronic: true,
  includeName: false,
};

export async function getOrCreateSettings(userId: number): Promise<AISettings> {
  let settings = await prisma.aISettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.aISettings.create({
      data: { userId, ...DEFAULT_SETTINGS },
    });
  }
  return {
    ...settings,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function updateSettings(
  userId: number,
  data: AISettingsUpdateInput
): Promise<AISettings> {
  const settings = await prisma.aISettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...DEFAULT_SETTINGS, ...data },
  });
  return {
    ...settings,
    updatedAt: settings.updatedAt.toISOString(),
  };
}
```

- 难度：简单

---

**Step 4**：后端 Controller 与 Routes

新建 `packages/backend/src/controllers/ai-settings.controller.ts`：

```typescript
import { Response } from 'express';
import { getRequestUser } from '../types/request-user';
import * as aiSettingsService from '../services/ai-settings.service';
import type { AISettingsUpdateInput } from '@ifly-medical/shared';

export async function getSettings(req: Express.Request, res: Response) {
  const settings = await aiSettingsService.getOrCreateSettings(getRequestUser(req).userId);
  res.json(settings);
}

export async function updateSettings(req: Express.Request, res: Response) {
  const data = req.body as AISettingsUpdateInput;
  const settings = await aiSettingsService.updateSettings(getRequestUser(req).userId, data);
  res.json(settings);
}
```

新建 `packages/backend/src/routes/ai-settings.routes.ts`：

```typescript
import { Router } from 'express';
import { aiSettingsUpdateSchema } from '@ifly-medical/shared';
import { validateRequest } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';
import { getSettings, updateSettings } from '../controllers/ai-settings.controller';

const router = Router();

router.get('/', asyncHandler(getSettings));
router.put('/', validateRequest({ body: aiSettingsUpdateSchema }), asyncHandler(updateSettings));

export default router;
```

在 `packages/backend/src/index.ts` 中注册路由：

```typescript
import aiSettingsRoutes from './routes/ai-settings.routes';
// ...
app.use('/api/ai-settings', aiSettingsRoutes);
```

- 难度：简单

---

**Step 5**：修改 Chat Service 注入用户画像

修改 `packages/backend/src/services/chat.service.ts`：

1. 新增导入和辅助函数：

```typescript
import * as aiSettingsService from './ai-settings.service';
import * as profileService from './profile.service';

// 字段标签映射
const FIELD_LABELS: Record<string, string> = {
  gender: '性别',
  age: '年龄',
  bloodType: '血型',
  height: '身高',
  weight: '体重',
  allergies: '过敏史',
  chronicDiseases: '慢性病史',
  name: '姓名',
};

function buildUserProfilePrompt(
  profile: { gender?: string | null; birthDate?: Date | null; bloodType?: string | null; height?: number | null; weight?: number | null; allergies?: string | null; chronicDiseases?: string | null; name: string } | null,
  settings: { includeGender: boolean; includeAge: boolean; includeBloodType: boolean; includeHeight: boolean; includeWeight: boolean; includeAllergies: boolean; includeChronic: boolean; includeName: boolean }
): string {
  if (!profile) return '';

  const parts: string[] = [];

  if (settings.includeName && profile.name) {
    parts.push(`姓名：${profile.name}`);
  }
  if (settings.includeGender && profile.gender) {
    parts.push(`性别：${profile.gender}`);
  }
  if (settings.includeAge && profile.birthDate) {
    // 精确计算年龄，考虑是否已过生日
    const birth = new Date(profile.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    // 有效性校验：跳过无效年龄
    if (age >= 0 && age < 150) {
      parts.push(`年龄：${age}岁`);
    }
  }
  if (settings.includeBloodType && profile.bloodType) {
    parts.push(`血型：${profile.bloodType}`);
  }
  if (settings.includeHeight && profile.height) {
    parts.push(`身高：${profile.height}cm`);
  }
  if (settings.includeWeight && profile.weight) {
    parts.push(`体重：${profile.weight}kg`);
  }
  if (settings.includeAllergies && profile.allergies) {
    parts.push(`过敏史：${profile.allergies}`);
  }
  if (settings.includeChronic && profile.chronicDiseases) {
    parts.push(`慢性病史：${profile.chronicDiseases}`);
  }

  return parts.length > 0 ? `用户信息：${parts.join('，')}` : '';
}
```

2. 修改 `sendMessage` 函数：

```typescript
export async function sendMessage(
  userId: number,
  sessionId: string,
  userContent: string
): Promise<{ reply: string; sessionId: string }> {
  if (!env.aiApiKey) {
    throw new AppError(503, 'AI_SERVICE_NOT_CONFIGURED', 'AI service is not configured');
  }

  const collision = await prisma.chatHistory.findFirst({
    where: { sessionId, NOT: { userId } },
  });
  if (collision) {
    throw new AppError(400, 'SESSION_ID_CONFLICT', 'sessionId 已被其他用户使用');
  }

  await prisma.chatHistory.create({
    data: { userId, sessionId, role: 'user', content: userContent },
  });

  const history = await prisma.chatHistory.findMany({
    where: { userId, sessionId },
    orderBy: { createdAt: 'desc' },
    take: MAX_HISTORY_MESSAGES,
  });

  // 获取用户画像
  const profile = await profileService.getProfile(userId);
  const aiSettings = await aiSettingsService.getOrCreateSettings(userId);
  const userProfilePrompt = buildUserProfilePrompt(profile, aiSettings);

  // 构建系统提示
  const systemPrompt = userProfilePrompt
    ? `${SYSTEM_PROMPT}\n\n${userProfilePrompt}`
    : SYSTEM_PROMPT;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.reverse().map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: env.aiModel,
    messages,
  });

  const reply = completion.choices[0]?.message?.content ?? '';

  await prisma.chatHistory.create({
    data: { userId, sessionId, role: 'assistant', content: reply },
  });

  return { reply, sessionId };
}
```

- 难度：中等

---

**Step 6**：前端 API Hooks

新建 `packages/frontend/src/api/ai-settings.ts`：

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AISettings, AISettingsUpdateInput } from '@ifly-medical/shared';
import { aiSettingsUpdateSchema } from '@ifly-medical/shared';
import http from './http';

async function fetchAISettings(): Promise<AISettings> {
  const res = await http.get<AISettings>('/api/ai-settings');
  return res.data;
}

async function updateAISettings(data: AISettingsUpdateInput): Promise<AISettings> {
  const res = await http.put<AISettings>('/api/ai-settings', aiSettingsUpdateSchema.parse(data));
  return res.data;
}

export function useAISettings() {
  return useQuery({
    queryKey: ['ai-settings'],
    queryFn: fetchAISettings,
    staleTime: 60 * 1000,
  });
}

export function useUpdateAISettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAISettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
    },
  });
}
```

- 难度：简单

---

**Step 7**：前端 AI 设置页面

新建 `packages/frontend/src/pages/AISettingsPage.tsx`：

页面结构：
- 标题：「AI 设置」
- 说明文字：「选择您希望 AI 了解的个人信息，以便获得更个性化的健康建议」
- Switch 列表，字段顺序：姓名、性别、年龄、血型、身高、体重、过敏史、慢性病史
- 姓名字段显示提示：「默认关闭，开启后 AI 将知道您的姓名」
- **弱提示逻辑**：用户勾选某字段但档案对应内容为空时，在开关右侧显示简短灰色提示文字「档案中暂无此信息」
- **防抖保存**：使用 lodash.debounce 或自定义 hook，300ms 防抖后触发 mutation
- **隐私提示**：页面底部显示小字「AI 仅在对话时使用您允许的信息，不会存储或分享」

需要同时获取 Profile 数据判断字段是否为空：
```typescript
const { data: profile } = useProfile();
const { data: settings } = useAISettings();
```

字段与 Profile 对应关系：
| 设置字段 | Profile 字段 |
|----------|--------------|
| includeName | name |
| includeGender | gender |
| includeAge | birthDate |
| includeBloodType | bloodType |
| includeHeight | height |
| includeWeight | weight |
| includeAllergies | allergies |
| includeChronic | chronicDiseases |

参考现有 `ProfilePage.tsx` 的表单样式。

- 难度：中等

---

**Step 8**：前端路由与菜单

修改 `packages/frontend/src/App.tsx`：

1. 懒加载页面：
```typescript
const AISettingsPage = lazy(() =>
  import('./pages/AISettingsPage').then((m) => ({ default: m.AISettingsPage }))
);
```

2. `PageKey` 类型添加 `'ai-settings'`

3. `menuItems` 在「健康概览」后添加：
```typescript
{ key: 'ai-settings', label: 'AI 设置', icon: <SettingOutlined /> },
```

4. `getSelectedMenuKey` 添加：
```typescript
if (pathname.startsWith('/ai-settings')) return 'ai-settings';
```

5. `Routes` 中添加：
```tsx
<Route path="/ai-settings" element={<PrivateRoute element={<AISettingsPage />} />} />
```

- 难度：简单

---

## 🔌 Interface Contract（接口契约）

### GET /api/ai-settings

获取当前用户的 AI 设置

**响应**：
```json
{
  "id": 1,
  "includeGender": true,
  "includeAge": true,
  "includeBloodType": true,
  "includeHeight": true,
  "includeWeight": true,
  "includeAllergies": true,
  "includeChronic": true,
  "includeName": false,
  "updatedAt": "2026-04-15T10:00:00.000Z"
}
```

### PUT /api/ai-settings

更新 AI 设置

**请求**：
```json
{
  "includeName": true,
  "includeWeight": false
}
```

**响应**：同 GET

---

## ✅ Acceptance Criteria（验收标准）

- [ ] 数据库迁移成功，AISettings 表创建正确
- [ ] GET /api/ai-settings 返回用户设置，新用户返回默认配置
- [ ] PUT /api/ai-settings 更新成功，返回更新后的设置
- [ ] 对话时 AI 系统提示包含用户允许的字段信息
- [ ] 用户关闭某字段后，AI 不再能看到该字段
- [ ] Profile 不存在时对话正常进行，不注入用户画像
- [ ] 年龄计算准确，未来日期不会产生负数年龄
- [ ] AI 设置页面正确展示各字段开关状态
- [ ] 勾选字段但档案对应内容为空时显示弱提示「档案中暂无此信息」
- [ ] 切换开关后防抖保存，刷新页面状态保持
- [ ] 高频切换开关时不会产生重复请求
- [ ] 左侧菜单显示「AI 设置」入口，点击跳转正确
- [ ] TypeScript 编译无错误
- [ ] 前端构建成功

---

## 🚫 Constraints & Anti-patterns（禁止项）

- ❌ 不要修改现有 Chat API 的接口签名（POST /api/chat 的请求/响应格式不变）
- ❌ 不要修改 ChatPanel 组件
- ❌ 不要在前端硬编码字段列表，应从 shared 类型导入
- ❌ 不要在系统提示中包含用户未开启的字段
- ❌ 不要引入新的 npm 依赖

---

## 📦 Out of Scope（不在范围内）

- 用户画像数据的加密存储
- 字段级别的数据脱敏展示
- 设置变更历史记录
- 事务保护（当前对话场景非金融级，单条消息失败可重试）
- 查询缓存策略（当前对话频率不高）

---

## 📎 Reference（参考资料）

- 现有 Profile 实现：`packages/backend/src/services/profile.service.ts`
- 现有 Chat 实现：`packages/backend/src/services/chat.service.ts`
- 参考页面：`packages/frontend/src/pages/ProfilePage.tsx`
- 架构规范：`AgentDocs/Project.md`
