const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const ticketSchema = mongoose.Schema({
  guildId: reqString,
  channelId: reqString,
  userId: reqString,
  transcript: {
    type: Array,
    required: true,
  },
  locked: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = mongoose.model("ticket", ticketSchema);
