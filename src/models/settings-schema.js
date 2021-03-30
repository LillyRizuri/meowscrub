const mongoose = require("mongoose");

const reqString = {
  type: String,
  required: true,
};

const settingsSchema = mongoose.Schema({
  guildId: reqString,
  chatbotChannel: reqString,
  suggestionsChannel: reqString,
  ticketCategory: reqString,
  ghostPingSetting: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model("guildSettings", settingsSchema);
