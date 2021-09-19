const Discord = require("discord.js");
const fetch = require("node-fetch");

const { duck } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["duck"],
  memberName: "duck",
  group: "images",
  description: "q u a c k",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  callback: async (client, message) => {
    const result = await fetch("https://random-d.uk/api/random").then((res) =>
      res.json()
    );

    const duckEmbed = new Discord.MessageEmbed()
      .setColor(duck)
      .setTitle("🦆   q u a c k")
      .setURL(result.url)
      .setImage(result.url)
      .setTimestamp();
    message.channel.send({ embeds: [duckEmbed] });
  },
};
