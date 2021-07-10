const mongoose = require("mongoose");

const mutedSchema = mongoose.Schema({
  guildId: String,
  users: Array,
});

module.exports = mongoose.model("muted", mutedSchema);
