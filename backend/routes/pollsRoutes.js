const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");

// Get poll by id
router.get("/:pollId", async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const doc = await Poll.findOne({ pollId });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json({ pollId: doc.pollId, question: doc.question, options: doc.options, counts: doc.counts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create or update a poll (admin-ish). Body: { pollId, question, options }
router.post("/", async (req, res) => {
  try {
    const { pollId, question, options } = req.body;
    if (!pollId || !Array.isArray(options)) return res.status(400).json({ error: "Invalid payload" });

    const counts = (await Poll.findOne({ pollId }))?.counts || options.map(() => 0);

    const doc = await Poll.findOneAndUpdate(
      { pollId },
      { pollId, question, options, counts },
      { upsert: true, new: true }
    );

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Vote on option index: POST /:pollId/vote { index }
router.post("/:pollId/vote", async (req, res) => {
  try {
    const pollId = req.params.pollId;
    const { index } = req.body;
    const doc = await Poll.findOne({ pollId });
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (typeof index !== "number" || index < 0 || index >= doc.counts.length) return res.status(400).json({ error: "Invalid index" });

    doc.counts[index] = (doc.counts[index] || 0) + 1;
    await doc.save();
    res.json({ counts: doc.counts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
