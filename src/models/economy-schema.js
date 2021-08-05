const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const reqNumber = {
  type: Number,
  required: true,
  default: 0
};

const economySchema = mongoose.Schema({
  userId: reqString,
  coins: reqNumber,
  coinBank: reqNumber,
  dailyStreak: reqNumber,
  dailyLastClaimed: reqNumber,
  bankCapacity: {
    type: Number,
    required: true,
    default: 500
  },
  inventory: {
    type: Array,
    required: true,
    default: []
  }
});

module.exports = mongoose.model("economy", economySchema);
