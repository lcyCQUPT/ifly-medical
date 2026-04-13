# 个人健康档案前端设计文档

**日期**：2026-04-13  
**状态**：已批准

---

## 1. 概述

为 ifly-medical 实现个人健康档案管理的前端页面。不含导航框架，`App.tsx` 直接渲染档案页。采用方案 A：单页状态机 + TanStack Query。

---

## 2. 文件结构

```
src/
├── api/
│   └── profile.ts          # TanStack Query hooks：useProfile、useUpsertProfile
├── pages/
│   └── ProfilePage.tsx     # 主页面，管理 loading/empty/view/edit 四种状态
├── components/
│   └── ProfileForm.tsx     # 表单组件，复用于创建和编辑
├── App.tsx                 # 替换：注册 QueryClientProvider，渲染 ProfilePage
└── main.tsx                # 不变
```

---

## 3. 数据流

```
App.tsx
└── QueryClientProvider
    └── ProfilePage
        ├── useProfile()         → GET /api/profile
        ├── useUpsertProfile()   → PUT /api/profile
        └── ProfileForm（edit 模式）
```

1. `ProfilePage` 挂载时 `useProfile()` 自动请求 `GET /api/profile`
2. 后端 404 → 空态；有数据 → 只读态
3. 点击「编辑/创建」→ `mode` 切为 `'edit'`，渲染 `ProfileForm`
4. 表单提交 → `useUpsertProfile()` 发 `PUT /api/profile`
5. 成功 → `invalidateQueries(['profile'])` 刷新，`mode` 切回 `'view'`

---

## 4. API Hooks（`src/api/profile.ts`）

```typescript
// useProfile：获取档案，staleTime 5 分钟
useQuery({
  queryKey: ['profile'],
  queryFn: () => axios.get('/api/profile').then(r => r.data),
  retry: (count, error) => error.response?.status !== 404 && count < 3,
})

// useUpsertProfile：提交档案
useMutation({
  mutationFn: (data: ProfileInput) => axios.put('/api/profile', data).then(r => r.data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
})
```

404 时不重试，`data` 为 `undefined`，`ProfilePage` 据此判断空态。

---

## 5. ProfilePage 状态机

| 状态 | 条件 | 展示 |
|------|------|------|
| loading | `isLoading === true` | `<Spin>` 居中 |
| empty | `data === undefined && !isLoading`（404） | 空态卡片 + 「立即创建档案」按钮 |
| view | `data` 存在 且 `mode === 'view'` | `<Descriptions>` 信息卡 + 「编辑」按钮 |
| edit | `mode === 'edit'` | `<ProfileForm>` + 保存/取消 |

**只读展示分组**（Ant Design `Descriptions`，`column={2}`）：

- **基本信息**：姓名、性别、出生日期、血型
- **体征数据**：身高（cm）、体重（kg）
- **病史记录**：过敏史、慢性病史
- 底部显示「最后更新：xxx」

---

## 6. ProfileForm 字段规格

| 字段 | 控件 | 规则 |
|------|------|------|
| 姓名（name） | `Input` | 必填 |
| 性别（gender） | `Select` | 选项：男 / 女 / 其他 |
| 出生日期（birthDate） | `DatePicker` | 提交时转 ISO 字符串 |
| 血型（bloodType） | `Select` | A+ A- B+ B- AB+ AB- O+ O- |
| 身高（height） | `InputNumber` | 单位 cm，min 0 |
| 体重（weight） | `InputNumber` | 单位 kg，min 0 |
| 过敏史（allergies） | `Input.TextArea` | 逗号分隔，可选 |
| 慢性病史（chronicDiseases） | `Input.TextArea` | 可选 |

**提交流程**：
1. `form.validateFields()` 触发前端校验
2. 将 `DatePicker` 的 `Dayjs` 对象转 `string`（`.toISOString()`），`undefined` 字段转 `null`
3. 调用 `useUpsertProfile().mutate(data)`
4. 成功回调中调用 `onSuccess()` prop 通知父组件切换模式

---

## 7. 不在本次范围内

- 整体应用导航/侧边栏（留待更多功能实现后统一添加）
- 错误边界（Error Boundary）
- 表单字段格式深度校验（如日期范围）
