const mongoose = require("mongoose");

const globalChatSchema = mongoose.Schema({
  userId: String,
  messageCount: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("global-chat", globalChatSchema);
