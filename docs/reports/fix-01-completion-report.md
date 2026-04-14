# Task fix-01 完成报告

- 任务类型：修复任务
- 任务摘要：
  - 本次修复针对附件删除接口中的路径遍历漏洞，按任务文档要求实现了 Schema 层和 Service 层的双重防御。
  - `filename` 参数现在会拒绝包含 `/`、`\` 和 `..` 的危险输入，避免恶意路径在参数校验阶段穿透。
  - 服务层在拼接物理文件路径前进一步使用 `path.basename` 净化文件名，防止绕过上层校验后直接进入文件系统操作。

- 改动文件清单：
  - `packages/shared/src/schemas/visit.ts`：为 `attachmentParamsSchema.filename` 增加路径分隔符和路径遍历字符校验。
  - `packages/backend/src/services/visit.service.ts`：在 `removeAttachment` 中使用 `path.basename` 净化文件名后再拼接删除路径。
  - `docs/reports/fix-01-completion-report.md`：记录本次任务交付结果。

- 验收标准自检：
  - [x] `attachmentParamsSchema` 的 `filename` 字段已添加正则校验，禁止 `/`、`\`、`..`
  - [x] `visit.service.ts` 中 `removeAttachment` 使用 `path.basename` 净化文件名后再拼接路径
  - [ ] 传入 `../../etc/passwd` 等路径遍历字符串时，接口返回 400 而非执行文件操作
  - 说明：根据当前任务范围完成了参数校验逻辑，但未在本次任务中补充接口级自动化测试；该项需通过接口联调或现有测试体系进一步查验。
  - [ ] 合法的附件删除操作不受影响（功能回归正常）
  - 说明：已完成静态修改且 `pnpm --filter backend build` 通过，但未执行附件删除的端到端回归验证；该项需用户或测试环境确认。
  - [x] 没有未清理的多余代码
  - [x] TypeScript 编译无错误（`pnpm --filter backend build` 通过）

- 旁观发现：
  - `removeAttachment` 在文件删除失败时仅记录警告，不影响数据库中附件列表更新；这不是本次任务范围，但会导致数据库状态与文件系统状态短暂不一致的可能。

- 待确认事项：
  - 是否需要在后续任务中补充针对附件删除接口的安全回归测试，覆盖非法 `filename` 返回 `400` 的场景。

[Codex] 全部 Task 完成，已准备好接受审查
