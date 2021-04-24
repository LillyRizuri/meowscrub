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

  run(message, args) {
    if (!args)
      return message.reply(
        "<:scrubred:797476323169533963> Provide a specific Pokémon in order to continue."
      );

    fetch(`https://some-random-api.ml/pokedex?pokemon=${args}`)
      .then((res) => res.json())
      .then((json) => {
        try {
          const embed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setThumbnail(json.sprites.animated)
            .setAuthor(
              `Pokédex for ID: ${json.id} | ${json.name.toProperCase()}`
            )
            .addFields(
              {
                name: "Species",
                value: json.species,
                inline: true,
              },
              {
                name: "Type",
                value: json.type,
                inline: true,
              },
              {
                name: "Height",
                value: json.height,
                inline: true,
              },
              {
                name: "Weight",
                value: json.weight,
                inline: true,
              },
              {
                name: "Gender Rate",
                value: json.gender,
                inline: true,
              },
              {
                name: "Abilities",
                value: json.abilities,
                inline: true,
              },
              {
                name: "Pokémon Description",
                value: json.description,
              }
            )
            .setFooter("Results Provide by Some Random Api")
            .setTimestamp();
          message.channel.send(embed);
        } catch (err) {
          message.reply(
            `<:scrubred:797476323169533963> No results for: **${args}**. Does it exist?`
          );
        }
      });
  }
};
