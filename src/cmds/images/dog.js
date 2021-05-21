const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");

const { dog } = require("../../assets/json/colors.json");

module.exports = class CatCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "dog",
      group: "images",
      memberName: "dog",
      description: "Random dog pic haha",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    try {
      fetch("https://dog.ceo/api/breeds/image/random")
        .then((res) => res.json())
        .then((json) => {
          const dogEmbed = new Discord.MessageEmbed()
            .setColor(dog)
            .setTitle("🐶 Woof!")
            .setURL(json.message)
            .setImage(json.message)
            .setTimestamp();
          message.channel.send(dogEmbed);
        });
    } catch (err) {
      message.reply(
        "An error from the API side has occured. Please try again later."
      );
    }
  }
};
