const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");

// Get aggregate for a key
router.get("/:key", async (req, res) => {
  try {
    const key = req.params.key;
    let doc = await Rating.findOne({ key });
    if (!doc) return res.json({ avg: 0, count: 0 });
    return res.json({ avg: doc.getAverage(), count: doc.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit a rating { key, value }
router.post("/", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || typeof value !== "number") return res.status(400).json({ error: "Invalid payload" });

    const doc = await Rating.findOneAndUpdate(
      { key },
      { $inc: { total: value, count: 1 } },
      { new: true, upsert: true }
    );

    return res.json({ avg: doc.getAverage(), count: doc.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Leaderboard: top N by average (min count threshold optional)
router.get("/top/list", async (req, res) => {
  try {
    const minCount = parseInt(req.query.minCount || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);

    const docs = await Rating.aggregate([
      { $match: { count: { $gte: minCount } } },
      { $project: { key: 1, avg: { $cond: [{ $eq: ["$count", 0] }, 0, { $divide: ["$total", "$count"] }] }, count: 1 } },
      { $sort: { avg: -1, count: -1 } },
      { $limit: limit }
    ]);

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
