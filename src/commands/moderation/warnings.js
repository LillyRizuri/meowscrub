const Discord = require("discord.js");
const { pagination } = require("reconlx");

const warnSchema = require("../../models/warn-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["warnings", "listwarn", "warns", "strikes"],
  memberName: "warnings",
  group: "moderation",
  description:
    "Displays all warnings from a specified user in the current server.",
  format: "<@user | userID>",
  examples: ["warnings @frockles"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["BAN_MEMBERS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const dateTimeOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    if (!args)
      return message.reply(
        emoji.missingEmoji + " No specified user for listing strikes."
      );

    let target;
    try {
      target =
        message.mentions.users.first() || (await client.users.fetch(args));
    } catch (err) {
      console.log(err);
      return message.reply(emoji.denyEmoji + " THAT'S not a valid user.");
    }

    const guildId = message.guild.id;
    const userTag = target.tag;
    const userAvatar = target.displayAvatarURL({ dynamic: true });
    const userId = target.id;

    const results = await warnSchema.findOne({
      guildId,
      userId,
    });

    let output = "";

    try {
      for (const warning of results.warnings) {
        const { author, authorId, timestamp, warnId, reason } = warning;

        const formattedTimestamp = new Date(timestamp).toLocaleDateString(
          "en-US",
          dateTimeOptions
        );

        output += `\`${warnId}: ${formattedTimestamp}\` - By **${author}** (${authorId})\n**Reason:** ${reason}\n\n`;
      }
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + " There's no warnings for that user."
      );
    }

    if (!output)
      return message.reply(
        emoji.denyEmoji + " There's no warnings for that user."
      );

    const splitOutput = Discord.Util.splitMessage(output, {
      maxLength: 1024,
      char: "\n\n",
      prepend: "",
      append: "",
    });

    if (splitOutput.length === 1) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`Previous warnings for ${userTag} (${userId})`, userAvatar)
        .setTitle(`${results.warnings.length} warn(s) in total`)
        .setDescription(splitOutput[0])
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    const embeds = [];

    for (let i = 0; i < splitOutput.length; i++) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`Previous warnings for ${userTag} (${userId})`, userAvatar)
        .setTitle(`${results.warnings.length} warn(s) in total`)
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
