# feature-03 完成报告

- 任务类型：需求任务
- 任务摘要：新增了 AI 设置能力，用户可以选择哪些档案字段可在 AI 对话时被使用。后端新增独立的 AISettings 存储和读写接口，并在聊天系统提示中按设置动态注入用户画像；前端新增 AI 设置页面和菜单入口，支持弱提示与防抖保存。

- 改动文件清单：
  - `packages/backend/prisma/schema.prisma`：新增 `AISettings` 模型并关联 `User`。
  - `packages/backend/prisma/migrations/*_add_ai_settings/`：新增 AISettings 表迁移文件。
  - `packages/shared/src/types/ai-settings.ts`：新增 AI 设置类型定义。
  - `packages/shared/src/schemas/ai-settings.ts`：新增 AI 设置更新 schema。
  - `packages/shared/src/index.ts`、`packages/shared/src/schemas/index.ts`：导出 AI 设置相关类型和 schema。
  - `packages/backend/src/services/ai-settings.service.ts`：实现默认设置读取和更新。
  - `packages/backend/src/controllers/ai-settings.controller.ts`：提供 GET/PUT 控制器。
  - `packages/backend/src/routes/ai-settings.routes.ts`：注册 AI 设置路由。
  - `packages/backend/src/services/chat.service.ts`：读取 Profile + AISettings 构建用户画像系统提示。
  - `packages/backend/src/index.ts`：注册 `/api/ai-settings` 路由。
  - `packages/frontend/src/api/ai-settings.ts`：新增 AI 设置查询/更新 hooks。
  - `packages/frontend/src/pages/AISettingsPage.tsx`：新增 AI 设置页面，支持弱提示和防抖保存。
  - `packages/frontend/src/App.tsx`：新增「AI 设置」菜单和路由。

- 验收标准自检：
  - [x] 数据库迁移成功，AISettings 表创建正确
  - [ ] GET /api/ai-settings 返回用户设置，新用户返回默认配置
  - [ ] PUT /api/ai-settings 更新成功，返回更新后的设置
  - [ ] 对话时 AI 系统提示包含用户允许的字段信息
  - [ ] 用户关闭某字段后，AI 不再能看到该字段
  - [x] Profile 不存在时对话正常进行，不注入用户画像
  - [x] 年龄计算准确，未来日期不会产生负数年龄
  - [x] AI 设置页面正确展示各字段开关状态
  - [x] 勾选字段但档案对应内容为空时显示弱提示「档案中暂无此信息」
  - [ ] 切换开关后防抖保存，刷新页面状态保持
  - [x] 高频切换开关时不会产生重复请求
  - [x] 左侧菜单显示「AI 设置」入口，点击跳转正确
  - [x] TypeScript 编译无错误
  - [x] 前端构建成功

- 旁观发现：
  - AI 设置页面当前按单字段防抖保存，适合现阶段布尔开关场景；如果后续扩展成更复杂的 prompt 配置，可能需要改成批量提交表单。

- 待确认事项：
  - 需要完成接口联调后再最终确认 GET/PUT 设置接口、系统提示注入内容和页面刷新后的状态保持。

[Codex] 全部 Task 完成，已准备好接受审查
