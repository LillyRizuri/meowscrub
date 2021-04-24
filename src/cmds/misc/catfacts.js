const Commando = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class CatFactsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "catfacts",
      group: "misc",
      memberName: "catfacts",
      description: "Sends random facts about cat.",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message) {
    try {
      fetch("https://some-random-api.ml/facts/cat")
        .then((res) => res.json())
        .then((json) => {
          message.channel.send(json.fact);
        });
    } catch (err) {
      message.reply(
        "An error from the API side has occured. Please try again later."
      );
    }
  }
};
