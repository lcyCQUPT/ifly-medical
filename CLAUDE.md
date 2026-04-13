# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. 项目概述

个人医疗健康信息管理，前后端分离，TypeScript语言，Monorepo（pnpm workspace + Git），路径别名。

| 层 | 技术 |
| --- | --- |
| 前端 | React、Vite、TypeScript、Ant Design、Tailwind、TanStack Query |
| 后端 | Node.js、Express |
| 数据 | SQLite、Prisma ORM |
| 大模型 | 阿里百炼（文档：<https://bailian.console.aliyun.com/cn-beijing?tab=doc#/doc/?type=model&url=2840915>） |

### 前端组件约定

- 优先使用 Ant Design 现成组件，或在 Ant Design 上轻量扩展；选能满足需求的最简组件，避免为次要能力引入复杂组件。
- 组件需可复用、可配置，避免把业务写死在单一页面里。

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

## 5. 协作与迭代规则（必须遵守）

1. **最小增量**：每轮只交付一个能编译、能跑通的最小功能；禁止同一轮内铺开多条业务线或「一次做完」。
2. **验收闭环**：本地编译/启动确认无误后再同步用户；**未经用户确认，不开始下一项**。
3. **实现深度**：主路径「少而完整」即可；未要求则不堆兜底分支与泛化错误处理。
4. **共享代码**：类型、枚举、通用工具**仅**放在 `packages/shared`，禁止前后端各维护一份副本。
5. **技术边界**：栈与依赖以本文、`docs/` 及用户明确指令为准；**不得**擅自加框架或 npm 包；需求、接口或约束不清时**先问再写**。

## 6. 环境变量

实现或运行涉及下列变量时，**提醒用户在本机配置取值**（名称以实际 `.env` / 代码为准）。

| 变量（示例） | 说明 |
| --- | --- |
| `DATABASE_URL` | 数据库连接 |
| `AI_API_KEY` | 大模型/百炼调用 |
| `PORT` | 后端监听端口（若使用） |

## 7. 扩展文档（实现时必读）

涉及下列内容时，**严格对照**对应文档，勿仅凭本文臆测。

| 主题 | 文档 |
| --- | --- |
| API 设计 | `docs/api.md` |
| 数据模型 | `docs/data-model.md` |
| 附件上传 | `docs/file-upload.md` |
