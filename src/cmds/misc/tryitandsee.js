const Commando = require("discord.js-commando");

module.exports = class TryItAndSeeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "tryitandsee",
      aliases: ["tias"],
      group: "misc",
      memberName: "tryitandsee",
      description: "Try it and see.",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message) {
    message.channel.send("https://tryitands.ee/");
  }
};
