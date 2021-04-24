const Commando = require("discord.js-commando");
const { fight } = require("weky");

module.exports = class FightCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "fight",
      group: "funs",
      memberName: "fight",
      description: "Fight to begone.",
      format: "<@user>",
      examples: ["fight @frockles#4339"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    const target = message.mentions.users.first();

    if (!target)
      return message.reply(
        "<:scrubnull:797476323533783050> Please request an user to fight."
      );

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> You cannot fight with bots. That's stupid."
      );

    if (target === message.author)
      return message.reply(
        "<:scrubred:797476323169533963> Are you trying to fight yourself? Seriously?"
      );

    const prepareFight = new fight({
        client: this.client,
        message: message,
        acceptMessage: `Do you want to fight **${message.author.tag}**?`,
        challenger: message.author,
        opponent: target,
    });

    prepareFight.start();
  }
};
