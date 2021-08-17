const Commando = require("discord.js-commando");

const ticketSchema = require("../../models/ticket-schema");

module.exports = class CloseTicketCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "lock",
      group: "ticket",
      memberName: "lock",
      description: "Lock an existing ticket created by me.",
      argsType: "single",
      format: "<#channel/channelID>",
      examples: [
        "close #ticket-693832549943869493",
        "close 866721249640448071",
      ],
      clientPermissions: ["MANAGE_CHANNELS"],
      userPermissions: ["MANAGE_CHANNELS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    let channel;

    if (!args) {
      channel = message.channel;
    } else if (args) {
      channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args);
      if (!channel)
        return message.reply(
          "<:scrubnull:797476323533783050> That's NOT a valid Channel ID."
        );
    }

    const channelId = channel.id;

    const results = await ticketSchema.findOne({
      guildId: message.guild.id,
      channelId,
    });

    if (!results)
      return message.reply(
        "<:scrubred:797476323169533963> The provided channel isn't in the database. What the heck are you doing?"
      );

    const ticketUser = await this.client.users.fetch(results.userId);

    message.channel.send("Attempting to lock the ticket channel...");

    if (!results.locked) {
      await ticketSchema.findOneAndUpdate(
        {
          guildId: message.guild.id,
          channelId,
        },
        {
          locked: true,
        }
      );

      await channel.updateOverwrite(ticketUser, {
        SEND_MESSAGES: false,
        VIEW_CHANNEL: true,
      });

      await message.reply(
        `<:scrubgreen:797476323316465676> Successfully locked this ticket: ${channel}`
      );
    } else if (results.locked) {
      await ticketSchema.findOneAndUpdate(
        {
          guildId: message.guild.id,
          channelId,
        },
        {
          locked: false,
        }
      );

      await channel.updateOverwrite(ticketUser, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
      });

      await message.reply(
        `<:scrubgreen:797476323316465676> Successfully unlocked this ticket: ${channel}`
      );
    }
  }
};
