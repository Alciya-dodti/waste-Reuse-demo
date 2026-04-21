const express = require("express");
const router = express.Router();
const ReuseIdea = require("../models/ReuseIdea");

// ─────────────────────────────────────────────
// SEARCH ROUTE
// GET /api/reuse/search?q=plastic bottle
// ─────────────────────────────────────────────
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;

    // Input validation
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ message: "Please enter a valid recyclable item." });
    }

    // Normalize and split input into keywords
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .map(k => k.trim())
      .filter(Boolean);

    if (keywords.length === 0) {
      return res.status(400).json({ message: "Please enter a valid recyclable item." });
    }

    // Build $or query for all keywords
    const orQueries = keywords.map(keyword => ({
      waste_name: { $regex: keyword, $options: "i" }
    }));

    // Find all matching reuse ideas (deduplicated)
    const data = await ReuseIdea.find({ $or: orQueries }).limit(20);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No recycling options found for this item. Please try a different keyword." });
    }

    res.json(data);

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
});

// ─────────────────────────────────────────────
// ADD REUSE IDEA ROUTE
// POST /api/reuse/add
// ─────────────────────────────────────────────
router.post("/add", async (req, res) => {
  try {
    const { waste_name, category, title, description, video_link, difficulty } = req.body;

    if (!waste_name || !title) {
      return res.status(400).json({ message: "waste_name and title are required" });
    }

    const newIdea = new ReuseIdea({
      waste_name,
      category: category || "General",
      title,
      description: description || "",
      video_link: video_link || "",
      difficulty: difficulty || "Easy"
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);

  } catch (err) {
    console.error("Add Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

module.exports = router;