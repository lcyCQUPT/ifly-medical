# REST API 约定

下列路径均相对于 **API 根路径**（如 `/api`，以实际挂载为准）。字段名与 Prisma / `packages/shared` 保持一致。

## 1. 全局约定

### 1.1 REST 与列表分页

- 资源操作遵循 REST 语义。
- 列表接口统一查询参数：`?page=1&limit=10`。
- 列表成功响应统一形态：`{ "data": [...], "total": <总数> }`。

### 1.2 错误响应

异常时遵守 HTTP 状态码语义，响应体统一为：

```json
{ "error": "错误提示信息" }
```

| 状态码 | 含义 |
| --- | --- |
| 400 | 参数校验失败（缺必填、格式错误等） |
| 401 | 未登录或认证失效（若启用鉴权） |
| 403 | 无权限 |
| 404 | 资源不存在（如指定 ID 无效） |
| 500 | 服务器或数据库内部错误 |

## 2. 个人档案 · `Profile`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/profile` | 获取档案 |
| PUT | `/profile` | 创建或更新（upsert） |

## 3. 就诊记录 · `Visit`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/visits` | 列表（分页、按日期排序） |
| GET | `/visits/:id` | 详情 |
| POST | `/visits` | 新增 |
| PUT | `/visits/:id` | 更新 |
| DELETE | `/visits/:id` | 删除 |
| POST | `/visits/:id/attachments` | 上传附件（`multipart`） |

## 4. 用药记录 · `Medication`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/medications` | 列表（可按 `isActive` 过滤） |
| GET | `/medications/:id` | 详情 |
| POST | `/medications` | 新增 |
| PUT | `/medications/:id` | 更新 |
| DELETE | `/medications/:id` | 删除 |

## 5. 健康指标 · `HealthMetric`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/metrics` | 列表（可按 `type` 过滤） |
| GET | `/metrics/trend/:type` | 某类型历史趋势 |
| POST | `/metrics` | 新增 |
| DELETE | `/metrics/:id` | 删除 |

## 6. AI 对话 · `Chat`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/chat` | 发消息，返回回复（含 `sessionId`） |
| GET | `/chat/history` | 会话列表 |
| GET | `/chat/history/:sessionId` | 某会话全部消息 |
| DELETE | `/chat/history/:sessionId` | 删除某会话 |
