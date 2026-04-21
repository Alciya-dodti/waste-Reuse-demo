const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  created_at: Date
}, { strict: false });

module.exports = mongoose.model("User", schema, "users");