const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");
const ticketSchema = require("../../models/ticket-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["ticket", "support"],
  memberName: "ticket",
  group: "ticket",
  description: "Open a ticket to communicate with staff members.",
  format: "<string>",
  examples: ["ticket someone is annoying me, and only me"],
  clientPermissions: ["MANAGE_CHANNELS", "ADD_REACTIONS", "EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const existingTicket = await ticketSchema.findOne({
      guildId: message.guild.id,
      userId: message.author.id,
    });

    if (existingTicket) {
      const existingChannel = message.guild.channels.cache.get(
        existingTicket.channelId
      );

      if (!existingChannel) {
        message.reply(
          "Huh... It seems like your old ticket is forcefully deleted by a server manager."
        );

        await ticketSchema.findOneAndDelete({
          guildId: message.guild.id,
          userId: message.author.id,
        });
      } else if (existingChannel) {
        return message.reply(
          emoji.denyEmoji +
            ` You already have a ticket present. [${existingChannel}]`
        );
      }
    }

    if (!args)
      return message.reply(
        emoji.missingEmoji + " There's no reason for opening your ticket."
      );

    if (args.length > 256)
      return message.reply(
        emoji.denyEmoji +
          " Limit your reason's character count to just 256 characters only."
      );

    const results = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    const parentChannel = message.guild.channels.cache.get(
      results.settings.ticketCategory
    );

    if (!parentChannel)
      return message.reply(
        emoji.missingEmoji +
          " There's no ticket category config. set. This is important to keep your ticket channel organized."
      );

    const parentChannelPermissions = parentChannel
      .permissionsFor(client.user.id)
      .toArray();

    const canSendMessages = parentChannelPermissions.includes("SEND_MESSAGES");
    const canSendEmbed = parentChannelPermissions.includes("EMBED_LINKS");
    const canViewChannel = parentChannelPermissions.includes("VIEW_CHANNEL");
    const canReadMsgHistory = parentChannelPermissions.includes(
      "READ_MESSAGE_HISTORY"
    );

    if (
      canSendMessages &&
      canSendEmbed &&
      canViewChannel &&
      canReadMsgHistory
      // eslint-disable-next-line no-empty
    ) {
    } else {
      return message.reply(
        emoji.denyEmoji +
          " It seems like I somehow can't manage the ticket channel's category properly. Please contact your nearest server manager to give me these permissions:\n`Send Messages, Embed Links, View Channel, Read Message History`"
      );
    }

    const channel = await message.guild.channels.create(
      `${message.author.username}-${message.author.discriminator}`,
      {
        type: "GUILD_TEXT",
        parent: parentChannel.id,
        topic: `[By @${message.author.tag}] ${args}`,
        reason: `Ticket created by ${message.author.tag}: ${args}`,
      }
    );

    await channel.permissionOverwrites.edit(message.guild.id, {
      VIEW_CHANNEL: false,
    });
    await channel.permissionOverwrites.edit(message.author, {
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
    });

    const ticketResponseEmbed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle("New Ticket From Someone")
      .setDescription(
        `
• Member: ${message.author} \`(${message.author.id})\`    
• Reason: \`${args}\`    
        `
      )
      .setFooter("support will be here for you shortly.");

    await channel.send({
      content: `${message.author.toString()} Welcome!`,
      embeds: [ticketResponseEmbed],
    });

    await new ticketSchema({
      guildId: message.guild.id,
      channelId: channel.id,
      userId: message.author.id,
      reason: args,
      locked: false,
    }).save();

    await message.reply(
      emoji.successEmoji +
        ` Successfully created your ticket. [${channel.toString()}]\nSupport will be here for you shortly.`
    );
  },
};
