# AgentDocs — 项目文档库

> 本目录由 Claude Code 负责维护，记录项目的设计规范、技术决策和运行状态。Claude Code以外的agent禁止修改目录下的文档
> **所有 Agent 在涉及相关领域时必须阅读索引确认是否有需要的文档，读取对应文档后再开始工作。**

---

## 文档索引

### 设计规范（Design Specs）

| 文档 | 内容 | 维护者 | 读取时机 |
|---|---|---|---|
| `Project.md` | 接口设计规范与接口清单 | Claude Code | 任何涉及接口的任务 |
| `Project.md` | 数据表结构与字段说明 | Claude Code | 任何涉及数据库的任务 |
| `Project.md` | 路由结构与页面映射 | Claude Code | 涉及路由/页面的任务 |
| `Project.md` | 系统架构与模块划分 | Claude Code | 架构相关决策前 |
| `CodeStyle.md` | 代码风格、命名规范、Commit 格式 | Claude Code | 每次编码和评审代码前 |

### 运行记录（Living Docs）

| 文档 | 内容 | 维护者 | 读取时机 |
|---|---|---|---|
| `Decisions.md` | 关键技术决策日志 | Claude Code | 做重大决策前（避免重复踩坑）|
| `TeamKnowledge.md` | 团队知识文档 | Claude Code | Claude在进行决策和安排任务前参考 |
| `Todos.md` | 待办清单 | Claude Code | Claude在拆分任务进行更新，考虑下一步动作的时候参考 |

---

## 文档维护规则

### Claude Code 的职责

- 在架构或设计变更时，**同步更新**对应的设计规范文档
- 每次关键决策后，在 `decisions.md` 追加记录
- 做出决策后续发现更好地实现方式时，在 `TeamKnowledge.md` 进行记录
- 当有需要记录待办事项的时候，在 `Todos.md` 进行记录
- 确保文档内容始终反映**当前状态**，而非历史状态

---
