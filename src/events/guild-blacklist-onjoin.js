const serverBlacklistSchema = require("../models/guild-blacklist-schema");

module.exports = {
  name: "guildCreate",
  async execute(guild) {
    const results = await serverBlacklistSchema.findOne({
      guildId: guild.id,
    });

    if (results) guild.leave();
  },
};
