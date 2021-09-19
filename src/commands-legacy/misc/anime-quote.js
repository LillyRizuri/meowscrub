const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  aliases: ["anime-quote"],
  memberName: "anime-quote",
  group: "misc",
  description: "Retrieve a random anime quote.",
  cooldown: 3,
  callback: async (client, message) => {
    const json = await fetch("https://some-random-api.ml/animu/quote").then(
      (res) => res.json()
    );

    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
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
      .setFooter("cool stuff by some random api")
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
