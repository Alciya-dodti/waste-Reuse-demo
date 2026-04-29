const mongoose = require("mongoose");

const PollSchema = new mongoose.Schema({
  pollId: { type: String, required: true, unique: true },
  question: { type: String },
  options: { type: [String], default: [] },
  counts: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Poll", PollSchema, "polls");
