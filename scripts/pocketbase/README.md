# PocketBase Docker 部署

## 目录结构

```
pocketbase/
├── docker-compose.yml    # Docker 配置
├── .env                  # 环境变量（不要提交到 Git）
├── pb_hooks/             # JS 扩展脚本
│   └── main.pb.js        # 示例钩子
├── pb_migrations/        # 数据库迁移
│   └── 1700000000_init_collections.pb.js
└── README.md             # 本文件
```

## 部署步骤

### 1. 准备服务器目录

在服务器上创建目录结构：

```bash
mkdir -p /www/dk_project/dk_app/pocketbase/pocketbase/{pb_data,pb_hooks,pb_migrations}
```

### 2. 上传文件

将以下文件/目录上传到服务器的 `APP_PATH`：

- `pb_hooks/` 目录及其内容
- `pb_migrations/` 目录及其内容

### 3. 配置环境变量

编辑 `.env` 文件，修改：

- `PB_ADMIN_PASSWORD` — 设置强密码
- `APP_PATH` — 确认服务器路径正确

### 4. 启动服务

```bash
docker compose up -d
```

### 5. 访问管理后台

浏览器打开：`http://your-server:8090/_/`

使用 `.env` 中配置的管理员邮箱和密码登录。

## JS 扩展开发

### 文件命名

- 钩子文件必须以 `.pb.js` 或 `.pb.ts` 结尾
- 迁移文件格式：`YYYYMMDDHHMMSS_description.pb.js`

### 常用 API

```javascript
// 自定义路由
routerAdd("GET", "/api/hello", (c) => {
  return c.json(200, { message: "Hello!" });
});

// CRUD 钩子
onRecordBeforeCreateRequest((e) => {
  /* ... */
});
onRecordAfterCreateRequest((e) => {
  /* ... */
});
onRecordBeforeUpdateRequest((e) => {
  /* ... */
});
onRecordAfterUpdateRequest((e) => {
  /* ... */
});

// 定时任务
cronAdd("*/5 * * * *", () => {
  /* 每 5 分钟 */
});
```

### 调试

查看容器日志：

```bash
docker logs -f pocketbase
```

修改 `pb_hooks` 中的文件后，PocketBase 会自动重新加载（无需重启容器）。

## 注意事项

- PocketBase JSVM 基于 goja（ES5.1+），不是 Node.js
- 不支持 `import/export` 语法
- 不支持 Node.js API（fs, http, crypto 等）
- 如需使用 npm 包，需用 esbuild 打包成单文件
