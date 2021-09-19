const Discord = require("discord.js");
const fetch = require("node-fetch");

const { cat } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["cat"],
  memberName: "cat",
  group: "images",
  description: "Cat.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  callback: async (client, message) => {
    const result = await fetch(
      "https://api.thecatapi.com/v1/images/search"
    ).then((res) => res.json());

    const catEmbed = new Discord.MessageEmbed()
      .setColor(cat)
      .setTitle("🐱 Meow.....")
      .setURL(result[0].url)
      .setImage(result[0].url)
      .setTimestamp();
    message.channel.send({ embeds: [catEmbed] });
  },
};
