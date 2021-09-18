const Discord = require("discord.js");

const settingsSchema = require("../models/settings-schema");
const ticketSchema = require("../models/ticket-schema");

const emoji = require("../assets/json/tick-emoji.json");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (!interaction.inGuild()) return;
    if (interaction.customId !== client.settings.ticketButtonId) return;

    const guildSettings = await settingsSchema.findOne({
      guildId: interaction.guildId,
    });

    if (!guildSettings || !guildSettings.settings.ticketChannel) return;

    const ticketChannel = guildSettings.settings.ticketChannel;

    if (interaction.channelId !== ticketChannel.channelId) return;
    if (interaction.message.id !== ticketChannel.messageId) return;

    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const existingTicket = await ticketSchema.findOne({
      guildId,
      userId,
    });

    if (existingTicket) {
      const existingChannel = interaction.guild.channels.cache.get(
        existingTicket.channelId
      );

      if (!existingChannel) {
        await ticketSchema.findOneAndDelete({
          guildId,
          userId,
        });
      } else if (existingChannel) {
        return interaction.reply({
          content:
            emoji.denyEmoji +
            ` You already have a ticket present. [${existingChannel}]`,
          ephemeral: true,
        });
      }
    }

    const channelPerms = interaction.channel
      .permissionsFor(client.user.id)
      .toArray();

    const requiredPerms = [
      "MANAGE_CHANNELS",
      "SEND_MESSAGES",
      "EMBED_LINKS",
      "VIEW_CHANNEL",
      "READ_MESSAGE_HISTORY",
    ];
    const clientMissingPerms = [];

    for (const permission of requiredPerms) {
      if (!channelPerms.includes(permission))
        clientMissingPerms.push(permission.split("_").join(" ").toProperCase());
    }

    if (clientMissingPerms.length > 0)
      return interaction.reply({
        content:
          emoji.denyEmoji +
          ` I need to have the following permission(s): \`${clientMissingPerms.join(
            ","
          )}\` in order to open the ticket.\nPlease report this to the staffs.`,
        ephemeral: true,
      });

    const channel = await interaction.channel.clone({
      name: `${interaction.user.username}-${interaction.user.discriminator}`,
      topic: `[By @${interaction.user.tag}]`,
      reason: `Ticket created by ${interaction.user.tag}`,
    });

    const channelId = channel.id;

    await channel.permissionOverwrites.edit(client.user, {
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
    });

    await channel.permissionOverwrites.edit(interaction.guildId, {
      VIEW_CHANNEL: false,
    });

    await channel.permissionOverwrites.edit(interaction.user, {
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
    });

    const ticketResponseEmbed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle("Ticket Created")
      .setDescription(
        `
Dear ${interaction.user}:
Thank you for reaching out to the staff team. Please wait patiently for the staffs...
`
      )
      .addFields({
        name: "Summary of the Ticket",
        value: `
⠀• Ticket Channel: ${channel} (${channelId})
⠀• Created by: ${interaction.user} (${userId})
          `,
      })
      .setTimestamp();

    if (guildSettings.settings.transcriptLog)
      ticketResponseEmbed.setFooter(
        "◉ This conversation can be monitored or recorded for reviewing purposes."
      );

    await channel.send({
      content: `${interaction.user.toString()}, Welcome!`,
      embeds: [ticketResponseEmbed],
    });

    await new ticketSchema({
      guildId,
      channelId,
      userId,
      locked: false,
    }).save();

    await interaction.reply({
      content:
        emoji.successEmoji +
        ` Successfully created your ticket. [${channel.toString()}]\nSupport will be here for you shortly.`,
      ephemeral: true,
    });
  },
};
