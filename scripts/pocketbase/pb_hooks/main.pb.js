// PocketBase JS 扩展入口
// 文件名必须以 .pb.js 或 .pb.ts 结尾

// ============================================
// 自定义 API 路由
// ============================================

// 健康检查端点
routerAdd("GET", "/api/health", (c) => {
  return c.json(200, {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// CRUD 钩子示例
// ============================================

// 创建记录前自动设置字段
onRecordBeforeCreateRequest((e) => {
  // 示例：自动设置 created_at 如果字段存在
  // e.record.set("status", "pending")
  console.log("Record before create:", e.record.id);
});

// 创建记录后执行操作
onRecordAfterCreateRequest((e) => {
  console.log("Record after create:", e.record.id);
});

// ============================================
// 定时任务示例
// ============================================

// 每天凌晨 3 点清理过期数据
cronAdd("0 3 * * *", () => {
  console.log("Running daily cleanup...");
  // 示例：删除 30 天前的临时记录
  // const records = $app.dao().findRecordsByFilter("temp_data", "created < @threshold", "-created", 100, 0, { threshold: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() })
  // records.forEach(r => $app.dao().deleteRecord(r))
});
