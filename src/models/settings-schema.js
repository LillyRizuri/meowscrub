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
      prefix: null,
      chatbotChannel: null,
      suggestionChannel: null,
      ticketChannel: {
        channelId: null,
        messageId: null
      },
      transcriptLog: null,
      globalChat: null,
      muteRole: null,
    },
  },
  commands: {
    type: Object,
    required: true,
  }
});

module.exports = mongoose.model("guildSettings", settingsSchema);
