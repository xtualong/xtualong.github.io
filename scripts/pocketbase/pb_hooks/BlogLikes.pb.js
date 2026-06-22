// BlogLikes 钩子 — 校验点赞数据完整性

// ============================================
// 创建前校验
// - count 必须为 0 或 1
// - url 必须存在
// ============================================
onRecordBeforeCreateRequest((e) => {
  const url = e.record.get("url");
  if (!url) {
    throw new BadRequestError("url is required");
  }

  const count = e.record.getFloat("count");
  if (count !== 0 && count !== 1) {
    // 自动修正为 1（首次创建即点赞）
    e.record.set("count", 1);
  }
}, "BlogLikes");

// ============================================
// 更新前校验
// - 只允许修改 count 字段
// - count 只能 +1（防篡改）
// ============================================
onRecordBeforeUpdateRequest((e) => {
  const dao = $app.dao();

  // 获取数据库中当前记录
  const original = dao.findRecordById("BlogLikes", e.record.id);
  const oldCount = original.getFloat("count");
  const newCount = e.record.getFloat("count");

  // 校验：count 只能增加 1
  if (newCount !== oldCount + 1) {
    throw new BadRequestError(
      "count can only be incremented by 1 (expected " +
        (oldCount + 1) +
        ", got " +
        newCount +
        ")",
    );
  }

  // 校验：不允许修改其他字段
  if (e.record.get("url") !== original.get("url")) {
    throw new BadRequestError("url cannot be modified");
  }
}, "BlogLikes");
