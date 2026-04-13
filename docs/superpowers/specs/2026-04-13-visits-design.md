# 就诊记录设计文档

**日期**：2026-04-13  
**状态**：已批准

---

## 1. 概述

为 ifly-medical 实现就诊记录（Visit）的增删改查功能。后端新增 5 个 REST 端点，前端用列表页 + 抽屉（Drawer）方案展示详情和表单。**本轮不含附件上传**，附件功能留待下一轮独立迭代。

---

## 2. 文件结构

```
新增文件：
packages/backend/src/
  services/visit.service.ts
  controllers/visit.controller.ts
  routes/visit.routes.ts
  src/index.ts                      # 修改：注册 /api/visits 路由

packages/frontend/src/
  api/visits.ts
  components/VisitForm.tsx
  pages/VisitsPage.tsx
  App.tsx                           # 修改：渲染 VisitsPage（临时，待后续加导航）
```

---

## 3. 后端

### 3.1 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/visits` | 分页列表，`?page=1&limit=10`，按 `visitDate` 倒序 |
| GET | `/api/visits/:id` | 单条详情，不存在返回 404 |
| POST | `/api/visits` | 新建，`visitDate` + `hospital` 必填 |
| PUT | `/api/visits/:id` | 更新，不存在返回 404 |
| DELETE | `/api/visits/:id` | 删除，不存在返回 404 |

### 3.2 响应格式

- **列表**：`{ "data": [...], "total": <总数> }`
- **单条/新建/更新**：返回完整 Visit 对象
- **删除**：`{ "success": true }`
- **错误**：`{ "error": "错误信息" }`（400 / 404 / 500）

### 3.3 service 层（`visit.service.ts`）

```typescript
getVisits(page: number, limit: number): Promise<{ data: Visit[], total: number }>
getVisit(id: number): Promise<Visit | null>
createVisit(data: VisitInput): Promise<Visit>
updateVisit(id: number, data: Partial<VisitInput>): Promise<Visit | null>
deleteVisit(id: number): Promise<boolean>
```

`VisitInput`：
```typescript
{
  visitDate: Date;
  hospital: string;
  department?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  doctorAdvice?: string | null;
  notes?: string | null;
}
```

### 3.4 controller 层（`visit.controller.ts`）

- **`getVisits`**：解析 `page`（默认 1）、`limit`（默认 10）为整数，调用 service
- **`getVisit`**：解析 `id`，不存在返回 404
- **`createVisit`**：校验 `visitDate`、`hospital` 必填（400），`visitDate` 转 `new Date()`
- **`updateVisit`**：解析 `id`，`visitDate` 若存在则转 `new Date()`，不存在记录返回 404
- **`deleteVisit`**：解析 `id`，不存在记录返回 404

Express v5：async 函数未捕获异常自动转 500，无需 try-catch。

---

## 4. 前端

### 4.1 数据层（`api/visits.ts`）

| Hook | 说明 |
|------|------|
| `useVisits(page, limit)` | `queryKey: ['visits', page, limit]`，staleTime 1 分钟 |
| `useCreateVisit()` | 成功后 `invalidateQueries(['visits'])` |
| `useUpdateVisit()` | 成功后 `invalidateQueries(['visits'])` |
| `useDeleteVisit()` | 成功后 `invalidateQueries(['visits'])` |

`VisitInput` 与后端一致（`visitDate` 为 ISO 字符串，由表单提交时转换）。

### 4.2 VisitForm 组件（`components/VisitForm.tsx`）

Props：`visit?: Visit`（有则编辑模式）、`onSuccess: () => void`、`onCancel: () => void`

| 字段 | 控件 | 规则 |
|------|------|------|
| 就诊日期（visitDate） | DatePicker | 必填 |
| 医院（hospital） | Input | 必填 |
| 科室（department） | Input | 可选 |
| 主诉（chiefComplaint） | Input.TextArea（rows=2） | 可选 |
| 诊断（diagnosis） | Input.TextArea（rows=2） | 可选 |
| 医嘱/建议（doctorAdvice） | Input.TextArea（rows=3） | 可选 |
| 备注（notes） | Input.TextArea（rows=2） | 可选 |

提交时将 `DatePicker` Dayjs 对象转为 `.toISOString()`，`undefined` 转 `null`。

### 4.3 VisitsPage 组件（`pages/VisitsPage.tsx`）

**状态**：
- `page: number`（当前页，默认 1）
- `drawerMode: 'detail' | 'create' | 'edit' | null`（null 时 Drawer 关闭）
- `selectedId: number | null`（Drawer 操作的记录 ID）

**Table 列**：
| 列 | 说明 |
|----|------|
| 就诊日期 | 格式 `YYYY-MM-DD`，按此列倒序（后端排序） |
| 医院 | hospital |
| 科室 | department，无则显示 `—` |
| 诊断 | diagnosis，无则显示 `—` |
| 操作 | 「查看」按钮，打开 detail 模式 Drawer |

**Drawer 内容**：
- **detail**：`Descriptions` 展示所有字段；底部「编辑」（切换到 edit 模式）和「删除」按钮（确认后调用 `useDeleteVisit`，成功关闭 Drawer）
- **create / edit**：嵌入 `VisitForm`；标题「新建就诊记录」/ 「编辑就诊记录」；成功后关闭 Drawer

**删除确认**：使用 Ant Design `Popconfirm` 包裹「删除」按钮，提示「确定删除该就诊记录？」。

---

## 5. 不在本次范围内

- 附件上传（`POST /api/visits/:id/attachments`）— 留待下一轮
- 路由跳转 / 导航框架 — 留待功能完整后统一整合
- 就诊记录与用药记录的关联展示
