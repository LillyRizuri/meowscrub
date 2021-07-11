const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const settingsSchema = mongoose.Schema({
  guildId: reqString,
  dmPunishment: {
    type: Boolean,
    required: true,
    default: false,
  },
  chatbotChannel: reqString,
  suggestionsChannel: reqString,
  ticketCategory: reqString,
  globalChat: reqString,
  muteRole: reqString,
});

module.exports = mongoose.model("guildSettings", settingsSchema);
