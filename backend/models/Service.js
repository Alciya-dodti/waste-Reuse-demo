const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  type: String,
  address: String,
  phone: String,
  icon: String,
  wasteTypes: [String],
  description: String
}, { strict: false });

module.exports = mongoose.model("Service", schema, "services");