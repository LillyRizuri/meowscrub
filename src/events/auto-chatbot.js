const fetch = require("node-fetch");
const utf8 = require("utf8");
const settingsSchema = require("../models/settings-schema");
const userBlacklist = require("../../user-blacklist.json");

module.exports = {
  name: "message",
  // eslint-disable-next-line no-unused-vars
  async execute(message, client) {
    try {
      let channel;
      const guildId = message.guild.id;
      const input = encodeURIComponent(message.content);

      const results = await settingsSchema.find({
        guildId,
      });

      for (let i = 0; i < results.length; i++) {
        const { chatbotChannel } = results[i];
        channel = chatbotChannel;
      }

      if (message.author.bot) return;
      if (channel.includes(message.channel.id)) {
        // If the user is blacklisted, return
        if (userBlacklist.indexOf(message.author.id) !== -1) {
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
