const Commando = require("discord.js-commando");
const fetch = require("node-fetch");

module.exports = class JokeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "joke",
      group: "funs",
      memberName: "joke",
      description: "\"Funny\" joke transfer here.",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message) {
    try {
      fetch("https://some-random-api.ml/joke")
        .then((res) => res.json())
        .then((json) => {
          message.channel.send(json.joke);
        });
    } catch (err) {
      message.reply(
        "An error from the API side has occured. Please try again later."
      );
    }
  }
};
