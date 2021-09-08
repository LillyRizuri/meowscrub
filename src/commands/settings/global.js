const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const color = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["global", "setglobal", "global-chat"],
  memberName: "global",
  group: "settings",
  description: "Set a Global Chat channel for this server.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "<#channel | channelID>",
  examples: ["setglobal #global", "setglobal disable"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["ADMINISTRATOR"],
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
              "settings.globalChat": channel.id,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        client.globalChat[message.guild.id] = channel.id;

        const confirmationEmbed = new Discord.MessageEmbed()
          .setColor(color.green)
          .setDescription(
            emoji.successEmoji +
              ` **Set the Global Chat Channel to:** ${channel}`
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
              "settings.globalChat": null,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        client.globalChat[message.guild.id] = null;

        const confirmationRemovalEmbed = new Discord.MessageEmbed()
          .setColor(color.green)
          .setDescription(
            emoji.successEmoji +
              " **Removed the configuration for the Global Chat.**"
          );
        message.channel.send({ embeds: [confirmationRemovalEmbed] });
        return;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.globalChat) {
          return message.reply(
            emoji.missingEmoji + " The text channel hasn't been set yet."
          );
        } else if (results && results.settings.globalChat) {
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(color.green)
            .setDescription(
              emoji.successEmoji +
                ` **Current Global Chat Channel Configuration:** <#${results.settings.globalChat}>`
            );
          message.channel.send({ embeds: [channelEmbed] });
        }
        break;
      }
    }
  },
};
