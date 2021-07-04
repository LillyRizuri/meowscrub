const mongoose = require("mongoose");

const blacklistSchema = mongoose.Schema({
  userId: String,
});

module.exports = mongoose.model("userBlacklist", blacklistSchema);
