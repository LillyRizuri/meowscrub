const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("docs")
    .setDescription("View documentations for Discord.JS.")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("Keywords to search the docs")
        .setRequired(true)
    ),
  group: "info",
  examples: ["docs Message"],
  clientPermissions: ["EMBED_LINKS"],
  callback: async (client, interaction) => {
    const args = interaction.options.getString("search-string");
    const uri = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
      args
    )}`;

    const result = await fetch(uri).then((res) => res.json());

    if (result && !result.error) {
      interaction.reply({ embeds: [result] });
    } else {
      return interaction.reply({
        content:
          emoji.denyEmoji +
          "There's no documentations found with that search query.",
        ephemeral: true,
      });
    }
  },
};
