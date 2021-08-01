const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const economySchema = mongoose.Schema({
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
  bankCapacity: {
    type: Number,
    required: true,
    default: 500
  }
});

module.exports = mongoose.model("economy", economySchema);
