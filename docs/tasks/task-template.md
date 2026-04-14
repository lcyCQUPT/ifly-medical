# Task: [功能名称] — [唯一任务ID，如 FEAT-01/FEAT-02]

## 📌 Context（上下文）

> 告诉Codex为什么要做这个，功能目的，解决什么问题，预期结果，防止它做出"逻辑上合理但方向错误"的决定

- **所属模块**: 示例：auth / payment / core
- **触发原因**: 用户反馈 / 架构升级 / 新需求 / 其他
- **依赖任务**: FEAT-038（已完成）、FEAT-040（并行）
- **影响范围**: 说明哪些文件/模块会被修改或影响

---

## 🎯 Objective（目标）

用一句话描述：实现 [什么功能]，使得 [谁] 可以 [做什么]。

---

## 🏗️ Architecture Decision（架构决策）
>
> 这是最关键的部分，Claude已经决策完毕，Codex不需要再思考

- **采用方案**: 方案A — 使用 Strategy Pattern
- **放弃方案**: 方案B（原因：增加了不必要的耦合）
- **核心约束**:
示例：
  - 必须兼容现有的 `UserService` 接口
  - 不允许擅自引入新的外部依赖
  - 数据库操作必须走 Repository 层

---

## 📁 File Map（文件地图）
>
> 精确到文件级别，Codex不需要自己判断在哪里写代码

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `src/services/PaymentStrategy.ts` | 策略接口定义 |
| 修改 | `src/services/OrderService.ts` | 注入新策略 |
| 修改 | `src/api/routes/order.ts` | 添加新endpoint |
| 新建 | `tests/unit/PaymentStrategy.test.ts` | 单元测试 |

---

## ⚙️ Implementation Steps（实现步骤）
>
> 原子化、有序、可逐步验证

**Step 1**: 定义 `IPaymentStrategy` 接口

- 位置: `src/services/PaymentStrategy.ts`
- 包含方法: `execute(order: Order): Promise<PaymentResult>`
- 接口契约: 抛出 `PaymentError` 而非返回错误码
- 难度: 简单

**Step 2**: 实现 `AlipayStrategy` 和 `WechatStrategy`

- 继承上述接口
- 调用已有的 `AlipayClient`（路径: `src/clients/AlipayClient.ts`）
- 注意: token刷新逻辑已在Client层处理，无需重复
- 难度: 中等
**Step 3**: 修改 `OrderService.processPayment()`

- 通过构造函数注入策略（不要用工厂函数）
- 保持原有方法签名不变
- 难度: 困难

---

## 🔌 Interface Contract（接口契约）
>
> 如果涉及API，精确定义，不留歧义

```typescript
// 输入
POST /api/orders/:orderId/pay
{
  method: 'alipay' | 'wechat',
  amount: number  // 单位：分
}

// 成功输出
{ success: true, transactionId: string, paidAt: ISO8601 }

// 失败输出  
{ success: false, code: 'INSUFFICIENT_BALANCE' | 'TIMEOUT', message: string }
```

---

## ✅ Acceptance Criteria（验收标准）
>
> 用于判断任务是否完成，代码静态检查，运行后的验收交由用户完成
示例：

- [ ] 任务中的提到功能均已实现
- [ ] 任务中提到的错误均已经修改
- [ ] 没有未清理的多余代码
- [ ] eslint检查通过
- [ ] 已经按照要求，错误信息统一使用 `PaymentError` 类型

---

## 🚫 Constraints & Anti-patterns（禁止项）
>
> 明确告诉Codex不能做什么，防止"自作聪明"
示例：

- ❌ 不要修改 `UserService`，本次任务不涉及
- ❌ 不要使用 `any` 类型
- ❌ 不要在 Service 层直接调用 HTTP 请求
- ❌ 不要改动数据库 Schema

---

## 📎 Reference（参考资料）

- 现有类似实现: `src/services/NotificationStrategy.ts`（参考结构）
- 参考文档: `AgentDocs/project.md`
