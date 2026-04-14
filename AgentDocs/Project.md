# 项目技术架构与设计（Project）

本文件为项目的**技术架构与设计总览**，由Clade Code进行维护和更新

## 1. 项目概述

个人医疗健康信息管理，前后端分离，TypeScript，Monorepo（pnpm workspace + Git）。

| 层 | 技术 |
| --- | --- |
| 前端 | React、Vite、TypeScript、Ant Design、Tailwind、TanStack Query |
| 后端 | Node.js、Express |
| 数据 | SQLite、Prisma ORM |
| 大模型 | 阿里百炼（文档：<https://bailian.console.aliyun.com/cn-beijing?tab=doc#/doc/?type=model&url=2840915>） |

### 1.1 基本约定

- 优先使用 Ant Design 现成组件，或在 Ant Design 上轻量扩展；选能满足需求的最简组件，避免为次要能力引入复杂组件。
- 组件需可复用、可配置，避免把业务写死在单一页面里。
- 要提保证用户的错误感知体验，错误信息要包含足够上下文，方便调试
- 对外 API 的错误响应格式保持一致
- 需要安装依赖时，优先通过包管理工具安装，而不是修改package.json文件

## 2. 业务功能

1. **个人基础档案**：姓名、性别、出生日期、血型、身高、体重、过敏史、慢性病史。**档案数据 ≠ 登录账号**。
2. **就诊记录**：就诊日期、医院、科室、医生、症状、诊断、医嘱/建议、附件上传。
3. **用药记录**：药品名、剂量、服用频率、起止时间、备注。
4. **健康指标**：手动录入（如血糖、血压、心率），支持趋势查看。
5. **AI 健康问答**：用户描述症状，模型解释并给出建议（非医疗诊断）。

## 3. 目录结构

```text
ifly-medical/
└── packages/
    ├── shared/                    # 前后端共享（类型、枚举、工具函数等）
    │   ├── types/                 # 类型
    │   ├── utils/                 # 工具函数
    │   └── constants/             # 常量
    ├── frontend/                  # 前端
    │   └── src/
    │       ├── api/               # React Query hooks（按功能模块分文件）
    │       ├── components/        # 共享 UI 组件
    │       └── pages/             # 页面
    └── backend/                   # 后端
        ├── prisma/                # schema.prisma、migrations
        └── src/
            ├── controllers/       # 控制器
            ├── services/          # 业务逻辑
            └── routes/            # 路由注册
```

## 4. 常用命令（Monorepo）

在仓库根目录执行；**具体 script 以各包 `package.json` 为准**。

```bash
pnpm install
pnpm --filter frontend <script>   # 如 dev / build / lint
pnpm --filter backend <script>    # 如 dev / start
```

## 5. REST API 设计

下列路径均相对于 **API 根路径**（如 `/api`，以实际挂载为准）。字段名与 Prisma / `packages/shared` 保持一致。

### 5.1 全局约定

#### 5.1.1 REST 与列表分页

- 资源操作遵循 REST 语义。
- 列表接口统一查询参数：`?page=1&limit=10`。
- 列表成功响应统一形态：`{ "data": [...], "total": <总数> }`。

#### 5.1.2 错误响应

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

### 5.2 资源与接口

#### 5.2.1 个人档案 · `Profile`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/profile` | 获取档案 |
| PUT | `/profile` | 创建或更新（upsert） |

#### 5.2.2 就诊记录 · `Visit`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/visits` | 列表（分页、按日期排序） |
| GET | `/visits/:id` | 详情 |
| POST | `/visits` | 新增 |
| PUT | `/visits/:id` | 更新 |
| DELETE | `/visits/:id` | 删除 |
| POST | `/visits/:id/attachments` | 上传附件（`multipart`） |
| DELETE | `/visits/:id/attachments/:filename` | 删除指定附件 |

**补充说明**

- `GET /visits`：查询参数 `page`、`limit`；成功响应 `{ "data": Visit[], "total": number }`
- `DELETE /visits/:id/attachments/:filename`：成功响应 `{ "success": true }`；附件不存在返回 `404`

#### 5.2.3 用药记录 · `Medication`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/medications` | 列表（可按 `isActive` 过滤） |
| GET | `/medications/:id` | 详情 |
| POST | `/medications` | 新增 |
| PUT | `/medications/:id` | 更新 |
| DELETE | `/medications/:id` | 删除 |

**补充说明**

- `GET /medications`：查询参数 `page`（默认 1）、`limit`（默认 20）、`isActive`（可选）；成功响应 `{ "data": Medication[], "total": number }`

#### 5.2.4 健康指标 · `HealthMetric`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/metrics` | 列表（可按 `type` 过滤） |
| GET | `/metrics/:id` | 单条详情 |
| GET | `/metrics/trend/:type` | 某类型历史趋势 |
| POST | `/metrics` | 新增 |
| DELETE | `/metrics/:id` | 删除 |

**补充说明**

- `GET /metrics`：查询参数 `page`（默认 1）、`limit`（默认 20）、`type`（可选）；成功响应 `{ "data": HealthMetric[], "total": number }`
- `GET /metrics/:id`：记录不存在返回 `404`

#### 5.2.5 AI 对话 · `Chat`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/chat` | 发消息，返回回复（含 `sessionId`） |
| GET | `/chat/history` | 会话列表 |
| GET | `/chat/history/:sessionId` | 某会话全部消息 |
| DELETE | `/chat/history/:sessionId` | 删除某会话 |

## 6. 数据模型（Prisma 语义）

下表为字段含义说明；**类型与约束以 `schema.prisma` 为准**。

### 6.1 `Profile` · 个人档案

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Int, PK | 自增 |
| name | String | 姓名 |
| gender | String? | 性别 |
| birthDate | DateTime? | 出生日期 |
| bloodType | String? | 如 A、AB、O+ |
| height | Float? | 身高（cm） |
| weight | Float? | 体重（kg） |
| allergies | String? | 过敏史，逗号分隔 |
| chronicDiseases | String? | 慢性病史 |
| updatedAt | DateTime | 最后更新 |

### 6.2 `Visit` · 就诊记录

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Int, PK | |
| visitDate | DateTime | 就诊日 |
| hospital | String | 医院 |
| department | String? | 科室 |
| chiefComplaint | String? | 主诉 |
| diagnosis | String? | 诊断 |
| doctorAdvice | String? | 医嘱 / 建议 |
| attachments | String? | 附件列表，JSON 数组字符串（结构见「附件上传与文件存储」） |
| notes | String? | 备注 |
| createdAt | DateTime | 创建时间 |

### 6.3 `Medication` · 用药记录

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Int, PK | |
| name | String | 药名 |
| dosage | String? | 如 `10mg` |
| frequency | String? | 如每日三次 |
| startDate | DateTime? | 开始 |
| endDate | DateTime? | 结束，可空 |
| isActive | Boolean | 是否在服 |
| visitId | Int?, FK | 可选关联就诊 |
| notes | String? | 备注 |

### 6.4 `HealthMetric` · 健康指标

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Int, PK | |
| type | String | 指标类型枚举，见下表 |
| value | Float | 数值，供趋势图使用 |
| unit | String? | 如 mmHg、mmol/L |
| recordedAt | DateTime | 记录时间 |
| visitId | Int?, FK | 可选关联就诊 |
| notes | String? | 备注 |

**`type` 取值（示例）**

| 取值 | 含义 |
| --- | --- |
| `systolic_blood_pressure` | 收缩压 |
| `diastolic_blood_pressure` | 舒张压 |
| `blood_sugar` | 血糖 |
| `weight` | 体重 |
| `heart_rate` | 心率 |

**血压**：收缩压与舒张压各存**一条记录**（两条 `type` 不同），勿用 `"120/80"` 单条混写。

### 6.5 `ChatHistory` · AI 对话

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Int, PK | |
| sessionId | String | 同一会话分组 |
| role | String | `user` / `assistant` |
| content | String | 正文 |
| createdAt | DateTime | 时间 |

## 7. 附件上传与文件存储

就诊相关附件使用**本地文件系统**保存；元数据写入 `Visit.attachments`（JSON 字符串）。

### 7.1 存储布局

按**就诊记录 ID**分子目录，根路径示例：

```text
backend/uploads/
└── visits/
    ├── 1/
    │   ├── report_1700000000000.pdf
    │   └── xray_1700000000001.jpg
    └── 2/
        └── lab_1700000000002.jpg
```

`uploads/` 通过 `express.static` 挂载，客户端可用返回的 **URL** 直接访问。

### 7.2 上传限制

| 项 | 规则 |
| --- | --- |
| 允许 MIME | `image/jpeg`、`image/png`、`application/pdf` |
| 单文件大小 | ≤ 10MB |
| 校验 | Multer：`fileFilter`（MIME）+ `limits.fileSize` |
| 不合规 | `400 Bad Request`，响应体示例见下 |

```json
{ "error": "仅支持 jpg/png/pdf 格式，且文件大小不超过 10MB" }
```

### 7.3 文件命名

| 项 | 说明 |
| --- | --- |
| 格式 | `{原始文件名去扩展名}_{时间戳}{扩展名}` |
| 示例 | `report_1700000000000.pdf` |
| 时间戳 | `Date.now()`，用于避免重名 |

### 7.4 上传接口响应

成功时返回由后端拼接的**完整 URL**（如 `req.protocol + '://' + req.get('host')` + 静态路径）：

```json
{
  "data": {
    "name": "report.pdf",
    "url": "http://localhost:3001/uploads/visits/1/report_1700000000000.pdf",
    "size": 204800,
    "uploadedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 7.5 数据库（`Visit.attachments`）

字段为 **JSON 数组的字符串**，元素结构应与上传响应中的 `data` 一致：

```json
[
  {
    "name": "report.pdf",
    "url": "http://localhost:3001/uploads/visits/1/report_1700000000000.pdf",
    "size": 204800,
    "uploadedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

新增附件时：读出已有数组 → 追加条目 → 整体写回，**勿覆盖**已有项。
