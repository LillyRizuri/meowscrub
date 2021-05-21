const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");

const { cat } = require("../../assets/json/colors.json");

module.exports = class CatCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "cat",
      group: "images",
      memberName: "cat",
      description: "Random cat pic HERE WE GO-",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    try {
      fetch("https://api.thecatapi.com/v1/images/search")
        .then((res) => res.json())
        .then((json) => {
          const catEmbed = new Discord.MessageEmbed()
            .setColor(cat)
            .setTitle("🐱 Meow.....")
            .setURL(json[0].url)
            .setImage(json[0].url)
            .setTimestamp();
          message.channel.send(catEmbed);
        });
    } catch (err) {
      message.reply(
        "An error from the API side has occured. Please try again later."
      );
    }
  }
};
