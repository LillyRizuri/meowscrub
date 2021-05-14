const Commando = require("discord.js-commando");

module.exports = class KillCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "kill",
      group: "funs",
      memberName: "kill",
      description:
        "Sick of someone? **Kill that person.** (We don't endorse murder in any shape or form, remember that.)",
      format: "<@user>",
      examples: ["kill @frockles#4339"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    const target = message.mentions.users.first();

    if (!target)
      return message.reply(
        "<:scrubnull:797476323533783050> Do it again, but this time actually mention someone to kill."
      );

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Okay you're dead. Pick someone else to kill for real."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> No. You can't just kill me like that."
        );
    }

    const killResponse = require("../../assets/json/kill-response.json");
    const randomKillResponse =
      killResponse[Math.floor(Math.random() * killResponse.length)];

    message.channel.send(
      randomKillResponse
        .split("{target}")
        .join(target.username)
        .split("{author}")
        .join(message.author.username)
    );
  }
};
