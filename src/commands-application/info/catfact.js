const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("catfact")
    .setDescription("Share a random fact about cats."),
  group: "info",
  callback: async (client, interaction) => {
    const json = await fetch("https://some-random-api.ml/facts/cat").then(
      (res) => res.json()
    );
    interaction.reply(json.fact);
  },
};
