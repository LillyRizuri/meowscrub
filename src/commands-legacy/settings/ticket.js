const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const color = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["ticket", "set-ticket", "ticket-channel"],
  memberName: "ticket",
  group: "settings",
  description: "Set the channel for me to send the ticket panel.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "<#channel | channelID>",
  examples: ["setticket #ticket", "setticket disable"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["MANAGE_GUILD"],
  singleArgs: true,
  cooldown: 3,
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

        const ticketEmbed = new Discord.MessageEmbed()
          .setAuthor(
            `${client.user.username}'s Ticket Panel`,
            client.user.displayAvatarURL()
          )
          .setColor("RANDOM")
          .setDescription(
            "To create a ticket, please interact with the button below.\n**Do not abuse it in any way.**"
          )
          .setFooter("Only open a ticket when you need to.");

        const row = new Discord.MessageActionRow().addComponents(
          new Discord.MessageButton()
            .setStyle("SECONDARY")
            .setCustomId(client.settings.ticketButtonId)
            .setEmoji("📩")
            .setLabel("Open a Ticket")
        );

        const msg = await channel.send({
          embeds: [ticketEmbed],
          components: [row],
        });

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.ticketChannel.channelId": channel.id,
              "settings.ticketChannel.messageId": msg.id,
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
              ` **Set the Ticket Channel to:** ${channel}

⠀• Remember to set the channel's user permissions for staffs accordingly so that the bot would let staffs access all tickets.
(View Channel, Send Messages, Read Message History, Manage Channels)
⠀• You may want to use the \`transcript-log\` command to log every ticket channel's messages.
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
              "settings.ticketChannel.channelId": null,
              "settings.ticketChannel.messageId": null,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );

        message.channel.send(
          emoji.successEmoji +
            " **Removed the configuration for the Ticket Channel.**"
        );
        return;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.ticketChannel.channelId)
          return message.reply(
            emoji.missingEmoji + " The category channel ID hasn't been set yet."
          );
        else if (results && results.settings.ticketChannel.channelId)
          message.channel.send(
            emoji.successEmoji +
              ` **Current Chatbot Channel Configuration:** <#${results.settings.ticketChannel.channelId}>`
          );
        break;
      }
    }
  },
};
