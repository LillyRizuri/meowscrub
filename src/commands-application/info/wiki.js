const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const util = require("../../util/util");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wiki")
    .setDescription("Search for a Wikipedia entry.")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("The specified Wikipedia entry")
        .setRequired(true)
    ),
  group: "info",
  examples: ["wikipedia vietnam", "wikipedia phone"],
  clientPermissions: ["EMBED_LINKS"],
  callback: async (client, interaction) => {
    const input = encodeURIComponent(
      interaction.options.getString("search-string")
    );
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${input}`;

    const response = await fetch(url).then((res) => res.json());

    try {
      const wikiEmbed = new Discord.MessageEmbed()
        .setColor("#FAFAFA")
        .setAuthor(
          "Wikipedia",
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
        )
        .setTitle(response.title)
        .setURL(response.content_urls.desktop.page);

      if (response.type === "disambiguation") {
        wikiEmbed.setDescription(
          util.trim(response.extract, 3072) +
            `\n\n[${response.title} also refers to...](${response.content_urls.desktop.page})`
        );
      } else {
        wikiEmbed
          .setThumbnail(response.thumbnail.source)
          .setDescription(util.trim(response.extract, 4096));
      }

      interaction.reply({ embeds: [wikiEmbed] });
    } catch (err) {
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " That search query brings no result. Please try again with another one.",
        ephemeral: true,
      });
    }
  },
};
