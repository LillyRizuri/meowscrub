const Discord = require("discord.js");
const fs = require("fs");

const ticketSchema = require("../../models/ticket-schema");
const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["close"],
  memberName: "close",
  group: "ticket",
  description: "Close & delete an existing ticket created by me.",
  details: "Leave the parameter blank to let me identify the channel the command was ran in.",
  format: "[#channel | channelID]",
  examples: ["close #frockles-4339", "close 866721249640448071"],
  clientPermissions: ["MANAGE_CHANNELS"],
  userPermissions: ["MANAGE_CHANNELS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let channel;
    if (!args) {
      channel = message.channel;
    } else if (args) {
      channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args);
      if (!channel)
        return message.reply(
          emoji.denyEmoji + " That's NOT a valid Channel ID."
        );
    }

    const results = await ticketSchema.findOne({
      guildId: message.guild.id,
      channelId: channel.id,
    });

    if (!results)
      return message.reply(
        emoji.denyEmoji +
          " The provided channel isn't in the database. What the heck are you doing?"
      );

    message.channel.send("Attempting to close the ticket channel...");

    const ticketCreator = await client.users.fetch(results.userId);

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

        await transcriptChannel.send({
          content: `\`[${time} ${timezone}]\` ❌ **${ticketCreator.tag} (${ticketCreator.id})**'s ticket has been closed by **${message.author.tag} (${message.author.id})**.\nThe full transcript is down below:`,
          files: [transcriptFile],
        });

        fs.unlinkSync(`./${fileName}`);
      }
    }

    await ticketSchema.findOneAndDelete({
      guildId: message.guild.id,
      channelId: channel.id,
    });

    if (channel.id !== message.channel.id)
      message.reply(
        emoji.successEmoji + " Successfully closed the ticket channel."
      );

    await channel.delete(`Ticket closed by ${message.author.tag}`);
  },
};
