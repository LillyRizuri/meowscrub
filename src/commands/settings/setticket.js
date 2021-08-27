const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const color = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["setticket", "ticketcategory", "ticketparent"],
  memberName: "setticket",
  group: "settings",
  description: "Set a category to host ticket channels for this server.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "<channelCategoryID>",
  examples: ["setticket 123456789012345678", "setticket disable"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["ADMINISTRATOR"],
  singleArgs: true,
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message, args) => {
    const guildId = message.guild.id;
    const channel = message.guild.channels.cache.get(args);

    switch (args.toLowerCase()) {
      default: {
        if (!channel)
          return message.reply(
            emoji.missingEmoji +
              " No valid channel found for the configuration."
          );

        if (channel.type !== "GUILD_CATEGORY")
          return message.reply(
            emoji.denyEmoji + " It isn't a valid category channel ID"
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
              "settings.ticketCategory": channel.id,
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
            emoji.successEmoji +
              ` **Set the Ticket Category Channel to:** \`${channel.name} - ${channel.id})\`


Remember to set the category's user permissions for staffs accordingly.
And, you may want to use the \`transcript-log\` command to log every ticket channel's all messages.
`
          );
        message.channel.send({ embeds: [confirmationEmbed] });
        break;
      }
      case "disable": {
        const guildSettings = await settingsSchema.findOne({
          guildId,
        });

        if (guildSettings && guildSettings.settings.transcriptLog)
          return message.reply(
            emoji.denyEmoji +
              " First, please remove the configuration for Transcript Log using the `transcript-log disable` command."
          );

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.ticketCategory": null,
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
              " **Removed the configuration for the Ticket Category Channel.**"
          );
        message.channel.send({ embeds: [confirmationRemovalEmbed] });
        return;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.ticketCategory) {
          return message.reply(
            emoji.missingEmoji + " The category channel ID hasn't been set yet."
          );
        } else if (results && results.settings.ticketCategory) {
          const ticketCategoryName = message.guild.channels.cache.get(
            results.ticketCategory
          ).name;
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(color.green)
            .setDescription(
              emoji.successEmoji +
                ` **Current Chatbot Channel Configuration:** \`${ticketCategoryName} - ${results.settings.ticketCategory}\``
            );
          message.channel.send({ embeds: [channelEmbed] });
        }
        break;
      }
    }
  },
};
