const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class PokeDexCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "pokedex",
      aliases: ["pokemon", "pkmn"],
      group: "misc",
      memberName: "pokedex",
      description: "Search for a Pokémon's data.",
      argsType: "single",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
    if (!args)
      return message.reply(
        "<:scrubred:797476323169533963> Provide a specific Pokémon in order to continue."
      );

    const pkmnData = await fetch(
      `https://some-random-api.ml/pokedex?pokemon=${args.toLowerCase()}`
    ).then((res) => res.json());

    try {
      const embed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setThumbnail(pkmnData.sprites.animated)
        .setAuthor(
          `Pokédex for ID: ${pkmnData.id} | ${pkmnData.name.toProperCase()}`
        )
        .addFields(
          {
            name: "Species",
            value: pkmnData.species,
            inline: true,
          },
          {
            name: "Type",
            value: pkmnData.type,
            inline: true,
          },
          {
            name: "Height",
            value: pkmnData.height,
            inline: true,
          },
          {
            name: "Weight",
            value: pkmnData.weight,
            inline: true,
          },
          {
            name: "Gender Rate",
            value: pkmnData.gender,
            inline: true,
          },
          {
            name: "Abilities",
            value: pkmnData.abilities,
            inline: true,
          },
          {
            name: "Pokémon Description",
            value: pkmnData.description,
          }
        )
        .setFooter("Results Provided by Some Random Api")
        .setTimestamp();
      message.channel.send(embed);
    } catch (err) {
      message.reply(
        `<:scrubred:797476323169533963> No results for: **${args}**. Does it exist?`
      );
    }
  }
};