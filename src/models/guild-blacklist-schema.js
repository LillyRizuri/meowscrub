const mongoose = require("mongoose");

const guildBlacklistSchema = mongoose.Schema({
  guildId: String,
  guildName: String,
  timestamp: Number,
});

module.exports = mongoose.model("guildBlacklist", guildBlacklistSchema);
