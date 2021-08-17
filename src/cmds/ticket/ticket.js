const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");
const ticketSchema = require("../../models/ticket-schema");

const { green } = require("../../assets/json/colors.json");

module.exports = class TicketCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      aliases: ["support"],
      group: "ticket",
      memberName: "ticket",
      description: "Create a basic ticket for you and staffs to talk.",
      argsType: "single",
      format: "<string>",
      examples: [
        "ticket ok someone is constantly pinging everyone and i can't handle it",
      ],
      clientPermissions: ["MANAGE_CHANNELS", "ADD_REACTIONS", "EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const guildId = message.guild.id;

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
          `<:scrubred:797476323169533963> You already have a ticket present. [${existingChannel}]`
        );
      }
    }

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no reason for opening your ticket."
      );

    message.delete();

    if (args.length > 512)
      return message.reply(
        "<:scrubred:797476323169533963> Limit your reason's character count to just 512 characters only."
      );

    const results = await settingsSchema.findOne({
      guildId,
    });

    const parentChannel = message.guild.channels.cache.get(
      results.settings.ticketCategory
    );

    if (!parentChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no ticket category config. set. This is important to keep your ticket channel organized."
      );

    const parentChannelPermissions = parentChannel
      .permissionsFor(this.client.user.id)
      .toArray();

    const canSendMessages = parentChannelPermissions.includes("SEND_MESSAGES");
    const canSendEmbed = parentChannelPermissions.includes("EMBED_LINKS");
    const canViewChannel = parentChannelPermissions.includes("VIEW_CHANNEL");
    const canReadMsgHistory = parentChannelPermissions.includes("READ_MESSAGE_HISTORY");

    if (
      canSendMessages &&
      canSendEmbed &&
      canViewChannel &&
      canReadMsgHistory
    // eslint-disable-next-line no-empty
    ) {
    } else {
      return message.reply(
        "<:scrubred:797476323169533963> It seems like I somehow can't manage the ticket channel's category properly. Please contact your nearest server manager to give me these permissions:\n`Send Messages, Embed Links, View Channel, Read Message History`"
      );
    }

    const channel = await message.guild.channels.create(
      `${message.author.username}-${message.author.discriminator}`,
      {
        type: "text",
        parent: parentChannel.id,
        topic: `[By @${message.author.tag}] ${args}`,
        reason: `Ticket created by ${message.author.tag}: ${args}`,
      }
    );

    await channel.updateOverwrite(message.guild.id, {
      VIEW_CHANNEL: false,
    });
    await channel.updateOverwrite(message.author, {
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

    await channel.send(`${message.author} Welcome!`, ticketResponseEmbed);

    await new ticketSchema({
      guildId: message.guild.id,
      channelId: channel.id,
      userId: message.author.id,
      locked: false,
    }).save();

    const ticketCreatedEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Successfully created a ticket. [${channel}]\nSupport will be here for you shortly.`
      )
      .setFooter("good luck.")
      .setTimestamp();

    await message.channel.send(ticketCreatedEmbed).then((msg) => {
      setTimeout(() => {
        msg.delete();
      }, 7000);
    });
  }
};
