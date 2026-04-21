const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  category: String
}, { strict: false });

module.exports = mongoose.model("WasteItem", schema, "waste_items");