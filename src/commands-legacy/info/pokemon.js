const Discord = require("discord.js");
const fetch = require("node-fetch");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["pokemon", "pokedex", "pkmn"],
  memberName: "pokemon",
  group: "info",
  description: "Search for a Pokémon's information.",
  format: "<searchString>",
  examples: ["pokedex pikachu"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  singleArgs: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " Provide a specific Pokémon in order to continue."
      );

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
      message.channel.send({ embeds: [embed] });
    } catch (err) {
      message.reply(emoji.denyEmoji + " That's NOT a valid Pokémon name.");
    }
  },
};
