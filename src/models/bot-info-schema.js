const mongoose = require("mongoose");

const botInfoSchema = mongoose.Schema({
  cmdsExecuted: {
    type: Number,
    required: true,
    default: 0
  },
  cmdsExecutedFails: {
    type: Number,
    required: true,
    default: 0
  },
});

module.exports = mongoose.model("botinfo", botInfoSchema);