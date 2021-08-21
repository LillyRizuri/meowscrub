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
  },
  commands: {
    type: Object,
    required: true,
  }
});

module.exports = mongoose.model("guildSettings", settingsSchema);
