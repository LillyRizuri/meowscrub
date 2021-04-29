const guildBlacklistSchema = require("../models/guild-blacklist-schema");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    client.guilds.cache.forEach(async (guild) => {
      const results = await guildBlacklistSchema.findOne({
        guildId: guild.id,
      });

      if (results) guild.leave();
    });
  },
};
