const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const color = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["chatbot", "setchatbot"],
  memberName: "chatbot",
  group: "settings",
  description: "Set a chatbot channel for this server.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "<#channel | channelID>",
  examples: ["setchatbot #chatbot", "setchatbot disable"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["MANAGE_GUILD"],
  singleArgs: true,
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message, args) => {
    const guildId = message.guild.id;
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args);

    switch (args.toLowerCase()) {
      default: {
        if (!channel)
          return message.reply(
            emoji.missingEmoji +
              " No valid channel found for the configuration."
          );

        if (channel.type !== "GUILD_TEXT")
          return message.reply(
            emoji.denyEmoji + " It isn't a valid text channel."
          );

        if (!channel.viewable)
          return message.reply(
            emoji.denyEmoji + " I can't view your specified channel."
          );

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.chatbotChannel": channel.id,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        const confirmationEmbed = new Discord.MessageEmbed()
          .setColor(color.green)
          .setDescription(
            emoji.successEmoji + ` **Set the Chatbot Channel to:** ${channel}`
          );
        message.channel.send({ embeds: [confirmationEmbed] });
        break;
      }
      case "disable": {
        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.chatbotChannel": null,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        const confirmationRemovalEmbed = new Discord.MessageEmbed()
          .setColor(color.green)
          .setDescription(
            emoji.successEmoji +
              " **Removed the configuration for the Chatbot Channel.**"
          );
        message.channel.send({ embeds: [confirmationRemovalEmbed] });
        return;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.chatbotChannel) {
          return message.reply(
            emoji.missingEmoji + " The text channel hasn't been set yet."
          );
        } else if (results && results.settings.chatbotChannel) {
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(color.green)
            .setDescription(
              emoji.successEmoji +
                ` **Current Chatbot Channel Configuration:** <#${results.settings.chatbotChannel}>`
            );
          message.channel.send({ embeds: [channelEmbed] });
        }
        break;
      }
    }
  },
};
