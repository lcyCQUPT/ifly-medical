# 附件上传与文件存储

就诊相关附件使用**本地文件系统**保存；元数据写入 `Visit.attachments`（JSON 字符串）。

## 1. 存储布局

按**就诊记录 ID**分子目录，根路径示例：

```text
backend/uploads/
└── visits/
    ├── 1/
    │   ├── report_1700000000000.pdf
    │   └── xray_1700000000001.jpg
    └── 2/
        └── lab_1700000000002.jpg
```

`uploads/` 通过 `express.static` 挂载，客户端可用返回的 **URL** 直接访问。

## 2. 上传限制

| 项 | 规则 |
| --- | --- |
| 允许 MIME | `image/jpeg`、`image/png`、`application/pdf` |
| 单文件大小 | ≤ 10MB |
| 校验 | Multer：`fileFilter`（MIME）+ `limits.fileSize` |
| 不合规 | `400 Bad Request`，响应体示例见下 |

```json
{ "error": "仅支持 jpg/png/pdf 格式，且文件大小不超过 10MB" }
```

## 3. 文件命名

| 项 | 说明 |
| --- | --- |
| 格式 | `{原始文件名去扩展名}_{时间戳}{扩展名}` |
| 示例 | `report_1700000000000.pdf` |
| 时间戳 | `Date.now()`，用于避免重名 |

## 4. 上传接口响应

成功时返回由后端拼接的**完整 URL**（如 `req.protocol + '://' + req.get('host')` + 静态路径）：

```json
{
  "data": {
    "name": "report.pdf",
    "url": "http://localhost:3001/uploads/visits/1/report_1700000000000.pdf",
    "size": 204800,
    "uploadedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

## 5. 数据库（`Visit.attachments`）

字段为 **JSON 数组的字符串**，元素结构应与上传响应中的 `data` 一致：

```json
[
  {
    "name": "report.pdf",
    "url": "http://localhost:3001/uploads/visits/1/report_1700000000000.pdf",
    "size": 204800,
    "uploadedAt": "2024-01-01T10:00:00.000Z"
  }
]
```

新增附件时：读出已有数组 → 追加条目 → 整体写回，**勿覆盖**已有项。
