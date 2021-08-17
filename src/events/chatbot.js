const fetch = require("node-fetch");
const utf8 = require("utf8");
const settingsSchema = require("../models/settings-schema");
const userBlacklistSchema = require("../models/user-blacklist-schema");

module.exports = {
  name: "message",
  async execute(message) {
    if (message.channel.type === "dm") return;
    try {
      const guildId = message.guild.id;
      const input = encodeURIComponent(message.content);

      const results = await settingsSchema.findOne({
        guildId,
      });

      const channel = results.settings.chatbotChannel;

      if (message.author.bot) return;
      if (channel.includes(message.channel.id)) {
        const blacklistResults = await userBlacklistSchema.findOne({
          userId: message.author.id,
        });
        // If the user is blacklisted, return
        if (blacklistResults) {
          await message.delete();
          const msg = await message.channel.send(
            `**${message.author.username}**: You are blacklisted from using this functionality. For that, your message won't be delivered.`
          );

          setTimeout(() => {
            msg.delete();
          }, 5000);
          return;
        }

        if (message.mentions.users.first() || message.mentions.channels.first())
          return message.reply(
            "i can't chat properly when your message contains any user/channel mentions."
          );

        message.channel.startTyping();
        const response = await fetch(
          utf8.encode(
            `http://api.brainshop.ai/get?bid=${process.env.BRAINSHOP_BRAIN_ID}&key=${process.env.BRAINSHOP_API_KEY}&uid=${message.author.id}&msg=${input}`
          )
        );
        const json = await response.json();
        message.reply(json.cnt.toLowerCase());
        return message.channel.stopTyping(true);
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
