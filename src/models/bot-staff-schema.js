const mongoose = require("mongoose");

const botStaffSchema = mongoose.Schema({
  userId: String,
  lastUsername: String,
});

module.exports = mongoose.model("botStaff", botStaffSchema);
