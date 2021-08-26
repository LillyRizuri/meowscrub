const mongoose = require("mongoose");

const tagsSchema = mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  tags: {
    type: Array,
    required: true,
    default: [],
  },
});

module.exports = mongoose.model("tag", tagsSchema);
