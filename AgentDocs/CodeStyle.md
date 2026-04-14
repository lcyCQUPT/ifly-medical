# 代码风格规范

## 通用规范

- 缩进：[2空格]
- 引号：[单引号]
- 分号：[有]
- 最大行长：[100] 字符

> 优先以项目根目录的 `.eslintrc` / `pyproject.toml` / `.editorconfig` 为准，本文档为补充说明。

---

## 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 变量/函数 | camelCase | `getUserById` |
| 类/组件 | PascalCase | `UserProfile` |
| 常量 | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| 文件名 | kebab-case | `user-service.ts` |
| 数据库字段 | snake_case | `created_at` |

---

## 函数规范

- 单函数不超过 50 行
- 单一职责原则，一个函数只做一件事
- 注释说明「为什么」，而非「是什么」
- 避免魔法数字，使用命名常量

---
