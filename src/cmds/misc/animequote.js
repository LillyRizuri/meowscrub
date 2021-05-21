const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class AnimeQuoteCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "animequote",
      group: "misc",
      memberName: "animequote",
      description: "Random anime quote. What do you expect.",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message) {
    try {
      fetch("https://some-random-api.ml/animu/quote")
        .then((res) => res.json())
        .then((json) => {
          const quotesEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor("Random Anime Quote")
            .addFields(
              {
                name: "Quote",
                value: json.sentence,
              },
              {
                name: "By",
                value: json.characther,
                inline: true,
              },
              {
                name: "Existed In",
                value: json.anime,
                inline: true,
              }
            )
            .setFooter("cool stuff by Some Random Api")
            .setTimestamp();
          message.channel.send(quotesEmbed);
        });
    } catch (err) {
      message.reply(
        "An error from the API side has occured. Please try again later."
      );
    }
  }
};
