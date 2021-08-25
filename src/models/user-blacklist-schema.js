const mongoose = require("mongoose");

const blacklistSchema = mongoose.Schema({
  userId: String,
  timestamp: Number,
});

module.exports = mongoose.model("userBlacklist", blacklistSchema);
