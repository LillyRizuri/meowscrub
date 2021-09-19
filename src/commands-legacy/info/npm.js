const Discord = require("discord.js");
const searchNpmRegistry = require("search-npm-registry");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["npm", "npmjs", "npmpackage"],
  memberName: "npm",
  group: "info",
  description: "View information about NPM packages.",
  format: "<searchString>",
  examples: ["npm discord.js"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  singleArgs: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji +
          " You must provide a NPM Package name in order to continue."
      );

    const dateTimeOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    message.channel.send("🔍 **Searching with your input...**");
    const resultsArray = await searchNpmRegistry().text(args).size(1).search();
    if (resultsArray <= 0)
      return message.reply(
        emoji.denyEmoji + " That is NOT a valid NPM Package name."
      );

    const results = resultsArray[0];

    const modificationDate = new Date(results.date).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    const maintainers = [];
    for (let i = 0; i < results.maintainers.length; i++) {
      maintainers.push(results.maintainers[i].username);
    }

    const embed = new Discord.MessageEmbed()
      .setColor("#CB3837")
      .setTitle(results.name)
      .setURL(results.links.npm)
      .setAuthor("NPM", "https://i.imgur.com/24yrZxG.png")
      .setDescription(results.description)
      .addFields(
        {
          name: "Version",
          value: results.version,
          inline: true,
        },
        {
          name: "Author",
          value: results.author.username
            ? results.author.username
            : results.author.name,
          inline: true,
        },
        {
          name: "Modification Date",
          value: modificationDate,
          inline: true,
        },
        {
          name: "Publisher",
          value: results.publisher.username,
          inline: true,
        },
        {
          name: "Maintainer(s)",
          value: maintainers.join(", "),
          inline: true,
        }
      );

    if (results.keywords)
      embed.addFields({
        name: "Keyword(s)",
        value: results.keywords.join(", "),
      });

    embed.addFields({
      name: "Links",
      value: `[\`NPM Package\`](${results.links.npm})\`|\`[\`Homepage\`](${results.links.npm})\`|\`[\`Repository\`](${results.links.repository})\`|\`[\`Bugs\`](${results.links.bugs})`,
    });

    message.channel.send({ embeds: [embed] });
  },
};
