const Discord = require("discord.js");
const { pagination } = require("reconlx");

const warnSchema = require("../../models/warn-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: {
    name: "List Warnings",
    type: 2,
  },
  memberName: "list-warnings",
  description: "Displays all warnings from a specified user in the current server.",
  group: "context",
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["BAN_MEMBERS"],
  callback: async (client, interaction) => {
    const dateTimeOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    const target = interaction.options.getUser("user");

    const guildId = interaction.guild.id;
    const userTag = target.tag;
    const userAvatar = target.displayAvatarURL({ dynamic: true });
    const userId = target.id;

    const results = await warnSchema.findOne({
      guildId,
      userId,
    });

    let output = "";

    try {
      results.warnings = results.warnings.sort(
        (a, b) => b.timestamp - a.timestamp
      );

      for (const warning of results.warnings) {
        const { authorId, timestamp, warnId, reason } = warning;

        const formattedTimestamp = new Date(timestamp).toLocaleDateString(
          "en-US",
          dateTimeOptions
        );

        const author = await client.users.fetch(authorId);

        // output += `\`${warnId}: ${formattedTimestamp}\` - By **${author.tag}** (${authorId})\n**Reason:** ${reason}\n\n`;
        output += `**${warnId}**\n⠀• Date: \`${formattedTimestamp}\`\n⠀• By: \`${author.tag} (${authorId})\`\n⠀• Reason: \`${reason}\`\n\n`;
      }
    } catch (err) {
      return interaction.reply({
        content: emoji.denyEmoji + " There's no warnings for that user.",
        ephemeral: true,
      });
    }

    if (!output)
      return interaction.reply({
        content: emoji.denyEmoji + " There's no warnings for that user.",
        ephemeral: true,
      });

    interaction.reply("Listing warnings for the specified user...");

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
        .setAuthor(`Previous warnings for ${userTag} (${userId})`, userAvatar)
        .setDescription(splitOutput[i])
        .setFooter(`${results.warnings.length} warn(s) in total`)
        .setTimestamp();
      embeds.push(embed);
    }

    pagination({
      embeds: embeds,
      author: interaction.user,
      channel: interaction.channel,
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
