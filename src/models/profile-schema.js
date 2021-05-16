const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const profileSchema = mongoose.Schema({
  guildId: reqString,
  userId: reqString,
  coins: {
    type: Number,
    required: true,
    default: 0
  },
  coinBank: {
    type: Number,
    required: true,
    default: 0
  },
});

module.exports = mongoose.model("profiles", profileSchema);
