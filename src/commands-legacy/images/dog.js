const Discord = require("discord.js");
const fetch = require("node-fetch");

const { dog } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["dog"],
  memberName: "dog",
  group: "images",
  description: "Dog.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  callback: async (client, message) => {
    const result = await fetch("https://dog.ceo/api/breeds/image/random").then(
      (res) => res.json()
    );

    const dogEmbed = new Discord.MessageEmbed()
      .setColor(dog)
      .setTitle("🐶 Woof!")
      .setURL(result.message)
      .setImage(result.message)
      .setTimestamp();
    message.channel.send({ embeds: [dogEmbed] });
  },
};
