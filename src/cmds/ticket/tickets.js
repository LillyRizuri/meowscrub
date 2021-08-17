const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { PaginatedEmbed } = require("embed-paginator");

const ticketSchema = require("../../models/ticket-schema");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class CloseTicketCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "tickets",
      aliases: ["ticket-list"],
      group: "ticket",
      memberName: "tickets",
      description: "Display open and locked tickets.",
      userPermissions: ["MANAGE_MESSAGES"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    let results = await ticketSchema.find({
      guildId: message.guild.id,
    });

    let output = "";

    for (let i = 0; i < results.length; i++) {
      const { channelId, userId, locked } = results[i];

      const existingChannel = message.guild.channels.cache.get(channelId);

      if (!existingChannel) {
        await ticketSchema.findOneAndDelete({
          guildId: message.guild.id,
          channelId,
        });

        output += "";
      } else if (existingChannel) {
        const lockState = locked
          .toString()
          .replace("true", "Yes")
          .replace("false", "No");

        output += `**+ <#${channelId}> (${channelId})**\n⠀• Member: <@${userId}> (${userId})\n⠀• Locked: ${lockState}\n\n`;
      }
    }

    results = await ticketSchema.find({
      guildId: message.guild.id,
    });

    if (!output)
      return message.reply(
        "<:scrubred:797476323169533963> This server has no tickets created."
      );

    const splitOutput = Discord.Util.splitMessage(output, {
      maxLength: 1024,
      char: "\n\n",
      prepend: "",
      append: "",
    });

    const outputEmbed = new PaginatedEmbed({
      colours: [embedcolor],
      descriptions: splitOutput,
      duration: 60 * 1000,
      paginationType: "description",
      itemsPerPage: 1,
    })
      .setAuthor(`All tickets for ${message.guild.name}`)
      .setTitle(`${results.length} ticket(s) in total`)
      .setTimestamp();

    outputEmbed.send(message.channel);
  }
};
