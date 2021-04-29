const fetch = require("node-fetch");
const utf8 = require("utf8");
const settingsSchema = require("../models/settings-schema");
const userBlacklistSchema = require("../models/user-blacklist-schema");

module.exports = {
  name: "message",
  // eslint-disable-next-line no-unused-vars
  async execute(message, client) {
    try {
      let channel;
      const guildId = message.guild.id;
      const input = encodeURIComponent(message.content);

      const guildResults = await settingsSchema.find({
        guildId,
      });

      for (let i = 0; i < guildResults.length; i++) {
        const { chatbotChannel } = guildResults[i];
        channel = chatbotChannel;
      }

      if (message.author.bot) return;
      if (channel.includes(message.channel.id)) {
        const blacklistResults = await userBlacklistSchema.findOne({
          userId: message.author.id,
        });
        // If the user is blacklisted, return
        if (blacklistResults) {
          await message.delete();
          const msg = await message.channel.send(
            `${message.author}, You are blacklisted from using this functionality. For that, your message won't be delivered.`
          );

          setTimeout(() => {
            msg.delete();
          }, 5000);
          return;
        }

        message.channel.startTyping();
        const response = await fetch(
          utf8.encode(
            `http://api.brainshop.ai/get?bid=${process.env.BRAINSHOP_BRAIN_ID}&key=${process.env.BRAINSHOP_API_KEY}&uid=${message.author.id}&msg=${input}`
          )
        );
        const json = await response.json();
        message.channel.send(json.cnt.toLowerCase());
        return message.channel.stopTyping(true);
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
