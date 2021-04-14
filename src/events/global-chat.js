const Discord = require("discord.js");
const settingsSchema = require("../models/settings-schema");
const userBlacklist = require("../../user-blacklist.json");

const { embedcolor } = require("../assets/json/colors.json");

module.exports = async (client, message) => {
  let guildChannelId;
  let otherGuildChannelId;

  const currentGuildResults = await settingsSchema.find({
    guildId: message.guild.id,
  });

  for (let i = 0; i < currentGuildResults.length; i++) {
    const { globalChat } = currentGuildResults[i];
    guildChannelId = globalChat;
  }

  const thisChannel = message.guild.channels.cache.get(guildChannelId);
  // If the user is blacklisted, return
  try {
    if (guildChannelId.includes(message.channel.id)) {
      if (userBlacklist.indexOf(message.author.id.toString()) !== -1)
        return thisChannel.send(
          `${message.author}, You are blacklisted from using this functionality. For that, your message won't be delivered.`
        );
    }
  // eslint-disable-next-line no-empty
  } catch (err) {}

  if (message.channel.id === guildChannelId && !message.author.bot) {
    client.guilds.cache.forEach(async (guild) => {
      if (guild === message.guild) return;

      const otherGuildResults = await settingsSchema.find({
        guildId: guild.id,
      });

      for (let i = 0; i < otherGuildResults.length; i++) {
        const { globalChat } = otherGuildResults[i];
        otherGuildChannelId = globalChat;
      }

      const channel = guild.channels.cache.get(otherGuildChannelId);

      if (!channel) return;

      const attachment = message.attachments.first()
        ? message.attachments.first().proxyURL
        : null;

      const textEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setDescription(`**${message.author.tag}:** ${message.content}`);
      if (attachment) {
        textEmbed.setImage(attachment).addFields({
          name: "Attachments Sent",
          value: attachment,
        });
      }
      channel.send(textEmbed);
    });
  }
};
