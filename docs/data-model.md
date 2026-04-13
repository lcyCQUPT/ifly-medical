# 数据模型（Prisma 语义）

下表为字段含义说明；**类型与约束以 `schema.prisma` 为准**。

## 1. `Profile` · 个人档案

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

## 2. `Visit` · 就诊记录

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Int, PK | |
| visitDate | DateTime | 就诊日 |
| hospital | String | 医院 |
| department | String? | 科室 |
| chiefComplaint | String? | 主诉 |
| diagnosis | String? | 诊断 |
| doctorAdvice | String? | 医嘱 / 建议 |
| attachments | String? | 附件列表，JSON 数组字符串（结构见 `file-upload.md`） |
| notes | String? | 备注 |
| createdAt | DateTime | 创建时间 |

## 3. `Medication` · 用药记录

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

## 4. `HealthMetric` · 健康指标

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

## 5. `ChatHistory` · AI 对话

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | Int, PK | |
| sessionId | String | 同一会话分组 |
| role | String | `user` / `assistant` |
| content | String | 正文 |
| createdAt | DateTime | 时间 |
