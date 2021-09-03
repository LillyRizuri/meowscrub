const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const searchNpmRegistry = require("search-npm-registry");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("npm")
    .setDescription("View information about NPM packages.")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("The specified NPM package")
        .setRequired(true)
    ),
  group: "info",
  examples: ["npm discord.js"],
  clientPermissions: ["EMBED_LINKS"],
  callback: async (client, interaction) => {
    const args = interaction.options.getString("search-string");

    const dateTimeOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    interaction.reply("🔍 **Searching with your input...**");
    const resultsArray = await searchNpmRegistry().text(args).size(1).search();
    if (resultsArray <= 0)
      return interaction.editReply({
        content: emoji.denyEmoji + " That is NOT a valid NPM Package name.",
        ephemeral: true,
      });

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

    interaction.channel.send({ embeds: [embed] });
  },
};
