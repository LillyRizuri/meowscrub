const Commando = require("discord.js-commando");

const ticketSchema = require("../../models/ticket-schema");

module.exports = class CloseTicketCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "close",
      group: "ticket",
      memberName: "close",
      description: "Close & delete an existing ticket created by me.",
      argsType: "multiple",
      format: "<#channel/channelID> [--force]",
      examples: [
        "close #ticket-693832549943869493",
        "close 866721249640448071",
      ],
      clientPermissions: ["MANAGE_CHANNELS"],
      userPermissions: ["MANAGE_GUILD"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    let channel;
    let channelId;

    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> Please provide the channel by mentioning them or provide their ID."
      );

    if (!args[1]) {
      channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[0]);
      if (!channel)
        return message.reply(
          "<:scrubnull:797476323533783050> That's NOT a valid Channel ID."
        );
      channelId = channel.id;
    } else if (args[1].toLowerCase() === "--force") {
      channelId = args[0];
    }

    const results = await ticketSchema.findOne({
      guildId: message.guild.id,
      channelId,
    });

    if (!results)
      return message.reply(
        "<:scrubred:797476323169533963> The provided channel isn't in the database. What the heck are you doing?"
      );

    message.channel.send("Attempting to close the ticket channel...");

    await ticketSchema.findOneAndDelete({
      guildId: message.guild.id,
      channelId,
    });

    if (args[1] && args[1].toLowerCase() !== "--force") {
      message.reply(
        "<:scrubgreen:797476323316465676> Deleted the ticket channel from the database."
      );
    } else if (!args[1]) {
      await channel.delete(`Ticket closed by ${message.author.tag}`);

      if (channel.id !== message.channel.id)
        message.reply(
          "<:scrubgreen:797476323316465676> Successfully closed the ticket channel."
        );
    }
  }
};
