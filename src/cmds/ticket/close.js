const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fs = require("fs");

const ticketSchema = require("../../models/ticket-schema");
const settingsSchema = require("../../models/settings-schema");

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

    const ticketCreator = await this.client.users.fetch(results.userId);

    const guildSettings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    function formatInt(int) {
      if (int < 10) return `0${int}`;
      return int;
    }

    if (guildSettings && guildSettings.settings.transcriptLog) {
      const transcriptChannel = message.guild.channels.cache.get(
        guildSettings.settings.transcriptLog
      );

      if (!transcriptChannel) {
        message.channel.send(
          "Can't find the current transcript log channel. Maybe it was deleted."
        );
      } else if (transcriptChannel) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const today = new Date();
        const time =
          formatInt(today.getHours()) +
          ":" +
          formatInt(today.getMinutes()) +
          ":" +
          formatInt(today.getSeconds());

        const fileName = `${ticketCreator.username}-${ticketCreator.discriminator}.txt`;

        fs.writeFileSync(`./${fileName}`, results.transcript.join("\n\n"));

        const transcriptFile = new Discord.MessageAttachment(
          fs.createReadStream(`./${fileName}`)
        );

        fs.unlinkSync(`./${fileName}`);

        await transcriptChannel.send(
          `\`[${time} ${timezone}]\` ❌ **${ticketCreator.tag} (${ticketCreator.id})**'s ticket has been closed by **${message.author.tag} (${message.author.id})**.\nThe full transcript is down below:`,
          transcriptFile
        );
      }
    }

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
