const Discord = require("discord.js");
const settingsSchema = require("../models/settings-schema");
const blacklistSchema = require("../models/blacklist-schema");

module.exports = {
  name: "message",
  async execute(message, client) {
    try {
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
          const results = await blacklistSchema.findOne({
            userId: message.author.id,
          });

          if (results) {
            await message.delete();
            const msg = await thisChannel.send(
              `${message.author}, You are blacklisted from using this functionality. For that, your message won't be delivered.`
            );

            setTimeout(() => {
              msg.delete();
            }, 5000);
            return;
          }

          if (message.content.length > 1024) {
            await message.delete();
            const msg = await thisChannel.send(
              `${message.author}, Your message musn't be more than 1024 characters.`
            );

            setTimeout(() => {
              msg.delete();
            }, 5000);
            return;
          }
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

          // to prevent exploits using backticks
          const msgContentToSend = message.content.split("`").join("\"");

          const attachment = message.attachments.first()
            ? message.attachments.first().proxyURL
            : null;

          if (!attachment)
            return await channel
              .send(`**${message.author.tag}:**\n\`${msgContentToSend}\``)
              .catch(() => {
                message.channel.send(
                  `I can't deliver the message to **${guild}**`
                );
              });

          const attachmentToSend = new Discord.MessageAttachment(attachment);
          await channel
            .send(
              message.content
                ? `**${message.author.tag}:**\n\`${msgContentToSend}\``
                : `**${message.author.tag}:**`,
              attachmentToSend
            )
            .catch(() => {
              message.channel.send(
                `I can't deliver the message to **${guild}**`
              );
            });
        });
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
