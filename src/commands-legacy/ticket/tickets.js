const Discord = require("discord.js");
const { pagination } = require("reconlx");
const ticketSchema = require("../../models/ticket-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["tickets", "ticket-list"],
  memberName: "tickets",
  group: "ticket",
  description: "Display open and locked tickets.",
  userPermissions: ["MANAGE_MESSAGES"],
  cooldown: 3,
  guildOnly: true,
  callback: async (client, message) => {
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
        emoji.missingEmoji + " This server has no tickets created."
      );

    const splitOutput = Discord.Util.splitMessage(output, {
      maxLength: 1024,
      char: "\n\n",
      prepend: "",
      append: "",
    });

    const embeds = [];

    for (let i = 0; i < splitOutput.length; i++) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`All tickets for ${message.guild.name}`)
        .setTitle(`${results.length} ticket(s) in total`)
        .setDescription(splitOutput[i])
        .setTimestamp();
      embeds.push(embed);
    }

    pagination({
      embeds: embeds,
      author: message.author,
      channel: message.channel,
      fastSkip: true,
      time: 60000,
      button: [
        {
          name: "first",
          emoji: emoji.firstEmoji,
          style: "PRIMARY",
        },
        {
          name: "previous",
          emoji: emoji.leftEmoji,
          style: "PRIMARY",
        },
        {
          name: "next",
          emoji: emoji.rightEmoji,
          style: "PRIMARY",
        },
        {
          name: "last",
          emoji: emoji.lastEmoji,
          style: "PRIMARY",
        },
      ],
    });
  },
};
