const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const afkSchema = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  afk: reqString,
  username: reqString,
  timestamp: {
    type: Number,
    required: true,
  },
  pingCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("afk", afkSchema);
