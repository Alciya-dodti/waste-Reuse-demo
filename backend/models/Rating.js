const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  total: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
}, { timestamps: true });

RatingSchema.methods.getAverage = function () {
  return this.count ? this.total / this.count : 0;
};

module.exports = mongoose.model("Rating", RatingSchema, "ratings");
