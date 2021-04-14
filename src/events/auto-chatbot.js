const fetch = require("node-fetch");
const utf8 = require("utf8");
const settingsSchema = require("../models/settings-schema");
const userBlacklist = require("../../user-blacklist.json");

module.exports = async (client, message) => {
  // If the user is blacklisted, return
  if (userBlacklist.indexOf(message.author.id.toString()) !== -1) return;

  let channel;
  const guildId = message.guild.id;
  const input = encodeURIComponent(message.content);

  try {
    const results = await settingsSchema.find({
      guildId,
    });

    for (let i = 0; i < results.length; i++) {
      const { chatbotChannel } = results[i];
      channel = chatbotChannel;
    }

    if (message.author.bot) return;
    if (channel.includes(message.channel.id)) {
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
};
