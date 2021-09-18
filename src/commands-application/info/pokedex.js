const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pokedex")
    .setDescription("Search for a Pokémon's information.")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("The specified Pokémon")
        .setRequired(true)
    ),
  group: "info",
  examples: ["pokedex pikachu"],
  clientPermissions: ["EMBED_LINKS"],
  callback: async (client, interaction) => {
    const args = interaction.options.getString("search-string");
    try {
      const pkmnData = await fetch(
        `https://some-random-api.ml/pokedex?pokemon=${args.toLowerCase()}`
      ).then((res) => res.json());

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setThumbnail(pkmnData.sprites.animated)
        .setAuthor(
          `Pokédex for ID: ${pkmnData.id} | ${pkmnData.name.toProperCase()}`
        )
        .addFields(
          {
            name: "Species",
            value: pkmnData.species.toString(),
            inline: true,
          },
          {
            name: "Type",
            value: pkmnData.type.toString(),
            inline: true,
          },
          {
            name: "Height",
            value: pkmnData.height.toString(),
            inline: true,
          },
          {
            name: "Weight",
            value: pkmnData.weight.toString(),
            inline: true,
          },
          {
            name: "Gender Rate",
            value: pkmnData.gender.toString(),
            inline: true,
          },
          {
            name: "Abilities",
            value: pkmnData.abilities.toString(),
            inline: true,
          },
          {
            name: "Pokémon Description",
            value: pkmnData.description.toString(),
          }
        )
        .setFooter("results provided by some random api")
        .setTimestamp();
      interaction.reply({ embeds: [embed] });
    } catch (err) {
      interaction.reply({
        content: emoji.denyEmoji + " That's NOT a valid Pokémon name.",
        ephemeral: true,
      });
    }
  },
};
