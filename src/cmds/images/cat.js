const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const axios = require("axios");

const { cat } = require("../../assets/json/colors.json");

module.exports = class CatCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "cat",
      group: "images",
      memberName: "cat",
      description: "Random cat pic HERE WE GO-",
    });
  }

  async run(message) {
    try {
      axios.get("https://api.thecatapi.com/v1/images/search").then((res) => {
        const catEmbed = new Discord.MessageEmbed()
          .setColor(cat)
          .setTitle("🐱 Meow.....")
          .setURL(res.data[0].url)
          .setImage(res.data[0].url)
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
