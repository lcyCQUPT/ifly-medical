# 工程环境搭建 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建 ifly-medical monorepo 工程环境，包含根工作区、shared 包、frontend（Vite+React）、backend（Express+Prisma）四个部分，不含业务功能实现。

**Architecture:** pnpm workspace 管理三个包；shared 包直接以 TypeScript 源码供前后端引用；frontend 由 Vite 脚手架生成后补充配置；backend 手动初始化，以 ts-node + nodemon 运行。

**Tech Stack:** Node.js 22、pnpm 10、TypeScript、React 18、Vite、Ant Design、Tailwind CSS v3、TanStack Query、Express、Prisma、SQLite

---

## 文件结构总览

| 文件 | 职责 |
|------|------|
| `pnpm-workspace.yaml` | 声明 workspace 成员 |
| `package.json`（根） | 跨包启动脚本 |
| `tsconfig.base.json` | 共享 TS 基础配置 |
| `.gitignore` | 忽略规则 |
| `packages/shared/package.json` | shared 包元数据，exports 指向 src |
| `packages/shared/src/index.ts` | 统一导出入口 |
| `packages/shared/src/types/*.ts` | 各模块类型定义 |
| `packages/shared/src/constants/health-metric-types.ts` | 健康指标枚举常量 |
| `packages/frontend/` | Vite 脚手架生成 + 配置补充 |
| `packages/frontend/vite.config.ts` | 路径别名 + /api 代理 |
| `packages/frontend/tailwind.config.js` | Tailwind 扫描范围 |
| `packages/frontend/src/index.css` | Tailwind 指令入口 |
| `packages/backend/package.json` | backend 依赖声明 |
| `packages/backend/tsconfig.json` | backend TS 配置 |
| `packages/backend/nodemon.json` | 热重启配置 |
| `packages/backend/.env` | 环境变量（DATABASE_URL、PORT） |
| `packages/backend/src/index.ts` | Express 入口，挂载路由与静态目录 |
| `packages/backend/prisma/schema.prisma` | 5 张数据表定义 |

---

## Task 1：初始化根目录 workspace

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`

- [ ] **Step 1：创建 `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
```

- [ ] **Step 2：创建根 `package.json`**

```json
{
  "name": "ifly-medical",
  "private": true,
  "scripts": {
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "build": "pnpm --filter frontend build"
  }
}
```

- [ ] **Step 3：创建 `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 4：创建 `.gitignore`**

```
node_modules/
dist/
.env
packages/backend/prisma/dev.db
packages/backend/uploads/
*.log
.DS_Store
```

- [ ] **Step 5：初始化 git 仓库并提交**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
git init
git add pnpm-workspace.yaml package.json tsconfig.base.json .gitignore
git commit -m "chore: init monorepo workspace"
```

---

## Task 2：创建 shared 包

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/profile.ts`
- Create: `packages/shared/src/types/visit.ts`
- Create: `packages/shared/src/types/medication.ts`
- Create: `packages/shared/src/types/health-metric.ts`
- Create: `packages/shared/src/types/chat.ts`
- Create: `packages/shared/src/constants/health-metric-types.ts`

- [ ] **Step 1：创建目录结构**

```bash
mkdir -p packages/shared/src/types
mkdir -p packages/shared/src/constants
mkdir -p packages/shared/src/utils
```

- [ ] **Step 2：创建 `packages/shared/package.json`**

```json
{
  "name": "@ifly-medical/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

- [ ] **Step 3：创建 `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4：创建 `packages/shared/src/types/profile.ts`**

```typescript
export interface Profile {
  id: number;
  name: string;
  gender?: string;
  birthDate?: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronicDiseases?: string;
  updatedAt: string;
}
```

- [ ] **Step 5：创建 `packages/shared/src/types/visit.ts`**

```typescript
export interface Attachment {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export interface Visit {
  id: number;
  visitDate: string;
  hospital: string;
  department?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  doctorAdvice?: string;
  attachments?: Attachment[];
  notes?: string;
  createdAt: string;
}
```

- [ ] **Step 6：创建 `packages/shared/src/types/medication.ts`**

```typescript
export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  visitId?: number;
  notes?: string;
}
```

- [ ] **Step 7：创建 `packages/shared/src/types/health-metric.ts`**

```typescript
export interface HealthMetric {
  id: number;
  type: string;
  value: number;
  unit?: string;
  recordedAt: string;
  visitId?: number;
  notes?: string;
}
```

- [ ] **Step 8：创建 `packages/shared/src/types/chat.ts`**

```typescript
export interface ChatMessage {
  id: number;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  lastMessage: string;
  createdAt: string;
}
```

- [ ] **Step 9：创建 `packages/shared/src/constants/health-metric-types.ts`**

```typescript
export const HealthMetricType = {
  SYSTOLIC_BLOOD_PRESSURE: 'systolic_blood_pressure',
  DIASTOLIC_BLOOD_PRESSURE: 'diastolic_blood_pressure',
  BLOOD_SUGAR: 'blood_sugar',
  WEIGHT: 'weight',
  HEART_RATE: 'heart_rate',
} as const;

export type HealthMetricTypeValue = typeof HealthMetricType[keyof typeof HealthMetricType];

export const HealthMetricLabels: Record<HealthMetricTypeValue, string> = {
  systolic_blood_pressure: '收缩压',
  diastolic_blood_pressure: '舒张压',
  blood_sugar: '血糖',
  weight: '体重',
  heart_rate: '心率',
};
```

- [ ] **Step 10：创建 `packages/shared/src/index.ts`（统一导出）**

```typescript
export * from './types/profile';
export * from './types/visit';
export * from './types/medication';
export * from './types/health-metric';
export * from './types/chat';
export * from './constants/health-metric-types';
```

- [ ] **Step 11：提交**

```bash
git add packages/shared/
git commit -m "feat: add shared types and constants"
```

---

## Task 3：初始化 frontend

**Files:**
- Create: `packages/frontend/`（由 Vite 脚手架生成）
- Modify: `packages/frontend/vite.config.ts`
- Modify: `packages/frontend/tsconfig.app.json`（或 tsconfig.json）
- Create: `packages/frontend/tailwind.config.js`
- Create: `packages/frontend/postcss.config.js`
- Modify: `packages/frontend/src/index.css`
- Modify: `packages/frontend/package.json`（添加依赖）

- [ ] **Step 1：用 Vite 脚手架生成 frontend**

```bash
cd /Users/lcy/代码/Coding/ifly-medical/packages
pnpm create vite frontend --template react-ts
```

预期输出：`Done. Now run: cd frontend && pnpm install`

- [ ] **Step 2：安装业务依赖**

```bash
cd /Users/lcy/代码/Coding/ifly-medical/packages/frontend
pnpm add antd @ant-design/icons @tanstack/react-query axios
pnpm add -D tailwindcss@^3 postcss autoprefixer
pnpm add @ifly-medical/shared
```

- [ ] **Step 3：生成 Tailwind 配置文件**

```bash
cd /Users/lcy/代码/Coding/ifly-medical/packages/frontend
pnpm dlx tailwindcss init -p
```

预期：生成 `tailwind.config.js` 和 `postcss.config.js`

- [ ] **Step 4：更新 `packages/frontend/tailwind.config.js`**

将生成的文件中 `content` 改为：

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 5：在 `packages/frontend/src/index.css` 顶部添加 Tailwind 指令**

将文件内容替换为（保留原有 CSS 变量内容之前先清空）：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 6：替换 `packages/frontend/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
```

- [ ] **Step 7：在 tsconfig 中配置路径别名**

找到 `packages/frontend/tsconfig.app.json`（若不存在则修改 `tsconfig.json`），在 `compilerOptions` 中添加：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 8：创建目录结构**

```bash
mkdir -p packages/frontend/src/api
mkdir -p packages/frontend/src/components
mkdir -p packages/frontend/src/pages
```

- [ ] **Step 9：验证 frontend 能启动**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
pnpm --filter frontend dev
```

预期：终端显示 `VITE v5.x.x  ready in xxx ms`，浏览器访问 `http://localhost:5173` 显示 Vite + React 默认页面。确认后 Ctrl+C 停止。

- [ ] **Step 10：提交**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
git add packages/frontend/
git commit -m "feat: scaffold frontend with Vite, Tailwind, antd, TanStack Query"
```

---

## Task 4：初始化 backend

**Files:**
- Create: `packages/backend/package.json`
- Create: `packages/backend/tsconfig.json`
- Create: `packages/backend/nodemon.json`
- Create: `packages/backend/.env`
- Create: `packages/backend/src/index.ts`
- Create: `packages/backend/src/routes/.gitkeep`
- Create: `packages/backend/src/controllers/.gitkeep`
- Create: `packages/backend/src/services/.gitkeep`
- Create: `packages/backend/uploads/visits/.gitkeep`

- [ ] **Step 1：创建目录结构**

```bash
mkdir -p packages/backend/src/controllers
mkdir -p packages/backend/src/services
mkdir -p packages/backend/src/routes
mkdir -p packages/backend/uploads/visits
mkdir -p packages/backend/prisma
```

- [ ] **Step 2：创建 `packages/backend/package.json`**

```json
{
  "name": "@ifly-medical/backend",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "nodemon",
    "start": "node dist/index.js",
    "build": "tsc"
  },
  "dependencies": {
    "@ifly-medical/shared": "workspace:*",
    "@prisma/client": "^5.22.0",
    "cors": "^2.8.5",
    "express": "^4.21.2",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/multer": "^1.4.12",
    "@types/node": "^22.0.0",
    "nodemon": "^3.1.9",
    "prisma": "^5.22.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.7.3"
  }
}
```

> **注意**：版本号以实际 `pnpm add` 安装结果为准，上面仅为参考范围，实际执行 Step 5 的安装命令后，`package.json` 会自动写入正确版本。

- [ ] **Step 3：创建 `packages/backend/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 4：创建 `packages/backend/nodemon.json`**

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/index.ts"
}
```

- [ ] **Step 5：安装依赖**

```bash
cd /Users/lcy/代码/Coding/ifly-medical/packages/backend
pnpm add express cors multer @prisma/client
pnpm add -D typescript ts-node nodemon prisma @types/node @types/express @types/cors @types/multer
pnpm add @ifly-medical/shared
```

- [ ] **Step 6：创建 `packages/backend/.env`**

```
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
```

> 提醒用户：`.env` 已在 `.gitignore` 中，不会提交到仓库。后续添加 `AI_API_KEY` 也在此文件中配置。

- [ ] **Step 7：创建 `packages/backend/src/index.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT ?? '3001';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(Number(PORT), () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

- [ ] **Step 8：在各空目录下添加 `.gitkeep` 以保留目录**

```bash
touch packages/backend/src/controllers/.gitkeep
touch packages/backend/src/services/.gitkeep
touch packages/backend/src/routes/.gitkeep
touch packages/backend/uploads/visits/.gitkeep
```

- [ ] **Step 9：验证 backend 能启动**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
pnpm --filter backend dev
```

预期：终端显示 `Backend running on http://localhost:3001`

新开终端验证健康检查：

```bash
curl http://localhost:3001/api/health
```

预期响应：`{"status":"ok"}`

确认后 Ctrl+C 停止。

- [ ] **Step 10：提交**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
git add packages/backend/
git commit -m "feat: scaffold backend with Express and ts-node"
```

---

## Task 5：定义 Prisma Schema 并执行初始迁移

**Files:**
- Create: `packages/backend/prisma/schema.prisma`
- Create: `packages/backend/prisma/dev.db`（由 migrate 生成）
- Create: `packages/backend/prisma/migrations/`（由 migrate 生成）

- [ ] **Step 1：创建 `packages/backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Profile {
  id              Int       @id @default(autoincrement())
  name            String
  gender          String?
  birthDate       DateTime?
  bloodType       String?
  height          Float?
  weight          Float?
  allergies       String?
  chronicDiseases String?
  updatedAt       DateTime  @updatedAt
}

model Visit {
  id             Int            @id @default(autoincrement())
  visitDate      DateTime
  hospital       String
  department     String?
  chiefComplaint String?
  diagnosis      String?
  doctorAdvice   String?
  attachments    String?
  notes          String?
  createdAt      DateTime       @default(now())
  medications    Medication[]
  metrics        HealthMetric[]
}

model Medication {
  id        Int       @id @default(autoincrement())
  name      String
  dosage    String?
  frequency String?
  startDate DateTime?
  endDate   DateTime?
  isActive  Boolean   @default(true)
  visitId   Int?
  visit     Visit?    @relation(fields: [visitId], references: [id])
  notes     String?
}

model HealthMetric {
  id         Int      @id @default(autoincrement())
  type       String
  value      Float
  unit       String?
  recordedAt DateTime
  visitId    Int?
  visit      Visit?   @relation(fields: [visitId], references: [id])
  notes      String?
}

model ChatHistory {
  id        Int      @id @default(autoincrement())
  sessionId String
  role      String
  content   String
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2：执行初始迁移**

```bash
cd /Users/lcy/代码/Coding/ifly-medical/packages/backend
pnpm dlx prisma migrate dev --name init
```

预期输出包含：
```
✔ Generated Prisma Client
The following migration(s) have been applied:
  migrations/20xxxxxxxxxxxxxx_init/migration.sql
```

- [ ] **Step 3：验证数据库文件生成**

```bash
ls packages/backend/prisma/
```

预期：`dev.db  migrations  schema.prisma`

- [ ] **Step 4：提交（不含 dev.db，已在 .gitignore）**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
git add packages/backend/prisma/schema.prisma packages/backend/prisma/migrations/
git commit -m "feat: add Prisma schema with 5 models and initial migration"
```

---

## Task 6：验证整体联通并安装根依赖

**Files:** 无新文件

- [ ] **Step 1：在根目录执行全量安装**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
pnpm install
```

预期：所有包依赖解析完成，无报错。

- [ ] **Step 2：验证 shared 类型可被 backend 引用**

在 `packages/backend/src/index.ts` 顶部临时添加一行：

```typescript
import type { Profile } from '@ifly-medical/shared';
```

执行 TypeScript 类型检查：

```bash
cd /Users/lcy/代码/Coding/ifly-medical/packages/backend
pnpm exec tsc --noEmit
```

预期：无报错输出。  
验证后删除该临时 import 行，恢复原文件。

- [ ] **Step 3：验证 shared 类型可被 frontend 引用**

在 `packages/frontend/src/main.tsx` 顶部临时添加一行：

```typescript
import type { Profile } from '@ifly-medical/shared';
```

执行类型检查：

```bash
cd /Users/lcy/代码/Coding/ifly-medical/packages/frontend
pnpm exec tsc --noEmit
```

预期：无报错输出。  
验证后删除该临时 import 行，恢复原文件。

- [ ] **Step 4：最终提交**

```bash
cd /Users/lcy/代码/Coding/ifly-medical
git add -A
git commit -m "chore: verify monorepo workspace integration complete"
```

---

## 完成后的状态

执行完所有 Task 后，项目具备：
- ✅ pnpm workspace，三包联通
- ✅ shared 类型可被前后端引用
- ✅ `pnpm --filter frontend dev` 启动 Vite 开发服务器（port 5173）
- ✅ `pnpm --filter backend dev` 启动 Express 服务（port 3001），`/api/health` 可访问
- ✅ Prisma schema 5 张表，SQLite 数据库已迁移
- ✅ 文件上传目录 `uploads/visits/` 就绪
- ✅ `/api` 请求由 Vite 代理转发至 backend
