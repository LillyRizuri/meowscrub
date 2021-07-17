const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { red, green } = require("../../assets/json/colors.json");

module.exports = class TicketCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "ticket",
      aliases: ["support"],
      group: "ticket",
      memberName: "ticket",
      description: "Create a basic ticket for you and staffs to talk.",
      argsType: "single",
      format: "[string]",
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
    let channel;

    const channelNameCache = message.guild.channels.cache.find(
      (ch) => ch.name === `ticket-${message.author.id}`
    );

    if (channelNameCache)
      return message.reply(
        "<:scrubred:797476323169533963> Your ticket is already open. Check again."
      );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no reason for opening your ticket."
      );

    message.delete();

    if (args.length > 512)
      return message.reply(
        "<:scrubred:797476323169533963> Limit your reason to just 512 characters only."
      );

    const results = await settingsSchema.findOne({
      guildId,
    });

    const parentChannel = message.guild.channels.cache.get(
      results.ticketCategory
    );

    if (!parentChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no ticket category config. set. This is important to keep your ticket channel organized."
      );

    try {
      channel = await message.guild.channels.create(
        `ticket-${message.author.id}`,
        {
          type: "text",
          topic: `[By @${message.author.tag}] ${args}`,
          reason: `Ticket created by ${message.author.tag}`,
        }
      );

      channel.setParent(parentChannel);

      channel.updateOverwrite(message.guild.id, {
        SEND_MESSAGE: false,
        VIEW_CHANNEL: false,
      });
      channel.updateOverwrite(message.author, {
        SEND_MESSAGE: true,
        VIEW_CHANNEL: true,
      });
    } catch (err) {
      const missingPermissionsEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> I can't properly modify your ticket channel. Please contact a server manager to:\n**Whitelist me in the current Ticket Category.**"
        )
        .setFooter(
          "Req. Permissions: View Channels, Send Messages, Manage Channels, Add Reactions"
        );
      return message.reply(missingPermissionsEmbed);
    }

    const ticketResponseEmbed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setDescription(
        `Support will be here with you shortly with this following reason of opening your ticket:\n\`${args}\``
      )
      .setFooter(
        "🔒 = Lock Ticket | ⛔ = Delete Ticket (Resort to make changes to this ticket manually if I restarts)"
      );

    const ticketResponse = await channel.send(
      `${message.author} Welcome!`,
      ticketResponseEmbed
    );

    try {
      await ticketResponse.react("🔒");
      await ticketResponse.react("⛔");
    } catch (err) {
      channel.send("Huh. Can't set any reactions.");
    }

    const collector = ticketResponse.createReactionCollector(
      (reaction, user) =>
        message.guild.members.cache
          .find((member) => member.id === user.id)
          .hasPermission("ADMINISTRATOR"),
      {
        dispose: true,
      }
    );

    collector.on("collect", (reaction) => {
      switch (reaction.emoji.name) {
        case "🔒":
          channel.updateOverwrite(message.author, {
            SEND_MESSAGES: false,
          });
          break;
        case "⛔":
          channel.send("This ticket will self-destruct in 5 seconds.");
          setTimeout(() => channel.delete(), 5000);
          break;
      }
    });

    const ticketCreatedEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Thank you. Support will be here for you shortly. [${channel}]`
      )
      .setFooter("good luck.")
      .setTimestamp();

    message.channel.send(ticketCreatedEmbed).then((msg) => {
      setTimeout(() => {
        msg.delete();
      }, 7000);
    });
  }
};
