# 工程环境搭建设计文档

**日期**：2026-04-13  
**状态**：已批准

---

## 1. 概述

为 ifly-medical 个人医疗健康信息管理系统搭建 Monorepo 工程环境。采用 pnpm workspace 管理三个包：`shared`、`frontend`、`backend`。初始版本不含用户登录认证。

---

## 2. 整体目录结构

```
ifly-medical/
├── package.json              # 根 workspace，含跨包 scripts
├── pnpm-workspace.yaml       # packages/* 纳入 workspace
├── tsconfig.base.json        # 共享 TypeScript 基础配置
├── .gitignore
└── packages/
    ├── shared/               # 前后端共享：类型、枚举、工具函数
    ├── frontend/             # React + Vite 前端
    └── backend/              # Express + Prisma 后端
```

---

## 3. 根目录配置

### `pnpm-workspace.yaml`
```yaml
packages:
  - "packages/*"
```

### 根 `package.json` scripts
| 命令 | 说明 |
|------|------|
| `pnpm dev` | 并行启动前后端开发服务 |
| `pnpm --filter frontend dev` | 仅启动前端 |
| `pnpm --filter backend dev` | 仅启动后端 |
| `pnpm --filter frontend build` | 构建前端 |

### `tsconfig.base.json`
提供所有包继承的基础 TypeScript 配置，包含严格模式和路径别名基础设定。

---

## 4. packages/shared

**初始化方式**：手动创建  
**包名**：`@ifly-medical/shared`

### 目录结构
```
shared/
├── package.json
├── tsconfig.json
└── src/
    ├── types/        # 各模块类型定义（Profile、Visit、Medication 等）
    ├── constants/    # 枚举常量（HealthMetricType 等）
    └── utils/        # 通用工具函数
```

### 依赖
- devDependencies: `typescript`

---

## 5. packages/frontend

**初始化方式**：`pnpm create vite` (react-ts 模板)  
**包名**：`@ifly-medical/frontend`

### 核心依赖
| 包 | 用途 |
|----|------|
| `antd` | UI 组件库 |
| `@ant-design/icons` | 图标 |
| `tailwindcss` | 原子化 CSS |
| `@tanstack/react-query` | 服务端状态管理 |
| `axios` | HTTP 客户端 |
| `@ifly-medical/shared` | 共享类型（workspace 引用） |

### 目录结构（src/）
```
src/
├── api/          # React Query hooks，按功能模块分文件
├── components/   # 共享 UI 组件
├── pages/        # 页面组件
└── main.tsx
```

### 配置
- `vite.config.ts`：配置路径别名 `@` → `./src`，代理 `/api` → `http://localhost:3001`
- `tailwind.config.js`：扫描 `src/**` 文件

---

## 6. packages/backend

**初始化方式**：手动初始化（TypeScript + Express）  
**包名**：`@ifly-medical/backend`

### 核心依赖
| 包 | 用途 |
|----|------|
| `express` | HTTP 框架 |
| `@prisma/client` | 数据库 ORM 客户端 |
| `multer` | 文件上传中间件 |
| `cors` | 跨域 |
| `@ifly-medical/shared` | 共享类型（workspace 引用） |

### 开发依赖
| 包 | 用途 |
|----|------|
| `prisma` | ORM CLI（migrate、generate） |
| `typescript` | TS 编译器 |
| `ts-node` | 直接运行 TS |
| `nodemon` | 热重启 |
| `@types/express` `@types/node` `@types/multer` | 类型声明 |

### 目录结构
```
backend/
├── prisma/
│   ├── schema.prisma   # 数据模型
│   └── dev.db          # SQLite 文件（gitignore）
├── uploads/
│   └── visits/         # 就诊附件存储目录
└── src/
    ├── controllers/    # 请求处理
    ├── services/       # 业务逻辑
    ├── routes/         # 路由注册
    └── index.ts        # 入口，挂载路由与静态目录
```

### Prisma Schema 数据模型

按 `docs/data-model.md` 定义 5 张表：

| Model | 说明 |
|-------|------|
| `Profile` | 个人档案（唯一记录） |
| `Visit` | 就诊记录，含 `attachments` JSON 字段 |
| `Medication` | 用药记录，可关联 `Visit` |
| `HealthMetric` | 健康指标，可关联 `Visit` |
| `ChatHistory` | AI 对话历史 |

数据库提供者：`sqlite`，文件路径：`file:./dev.db`

### 环境变量（`.env`）
| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | `file:./prisma/dev.db` |
| `PORT` | 后端监听端口，默认 `3001` |
| `AI_API_KEY` | 阿里百炼调用密钥（AI 功能阶段配置） |

---

## 7. 不在本次范围内

- 用户登录认证（初始版本不实现）
- 生产环境构建优化
- CI/CD 配置
- 具体业务功能页面和 API 实现
