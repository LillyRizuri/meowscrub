const Commando = require("discord.js-commando");
const { WouldYouRather } = require("weky");

module.exports = class WouldYouRatherCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "would-you-rather",
      aliases: ["wyr"],
      group: "funs",
      memberName: "would-you-rather",
      description: "This command initiates a game of preference, made up of many \"would-you-rather\" questions with statistics and debate.",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    await WouldYouRather(message);
  }
};
