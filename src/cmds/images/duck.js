const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");

const { duck } = require("../../assets/json/colors.json");

module.exports = class DuckCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "duck",
      group: "images",
      memberName: "duck",
      description: "q u a c k",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    try {
      fetch("https://random-d.uk/api/random")
        .then((res) => res.json())
        .then((json) => {
          const duckEmbed = new Discord.MessageEmbed()
            .setColor(duck)
            .setTitle("🦆 Quack!")
            .setURL(json.url)
            .setImage(json.url)
            .setTimestamp();
          message.channel.send(duckEmbed);
        });
    } catch (err) {
      message.reply(
        "An error from the API side has occured. Please try again later."
      );
    }
  }
};
