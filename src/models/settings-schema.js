const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const settingsSchema = mongoose.Schema({
  guildId: reqString,
  settings: {
    type: Object,
    required: true,
    default: {
      dmPunishment: {
        type: Boolean,
        required: true,
        default: false,
      },
      chatbotChannel: reqString,
      suggestionChannel: reqString,
      ticketCategory: reqString,
      transcriptLog: reqString,
      globalChat: reqString,
      muteRole: reqString,
    },
  },
});

module.exports = mongoose.model("guildSettings", settingsSchema);
