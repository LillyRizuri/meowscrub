const mongoose = require("mongoose");

const guildBlacklistSchema = mongoose.Schema({
  guildId: String,
});

module.exports = mongoose.model("guildBlacklist", guildBlacklistSchema);
