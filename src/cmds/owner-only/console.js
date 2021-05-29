const Commando = require("discord.js-commando");
const process = require("child_process");

module.exports = class AvatarCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "console",
      aliases: ["shell", "terminal"],
      group: "owner-only",
      memberName: "console",
      description: "Run the bot's own terminal.",
      details: "Only the bot owner(s) may use this command.",
      argsType: "single",
      format: "<input>",
      hidden: true
    });
  }

  run(message, args) {
    if (!this.client.isOwner(message.author)) {
      return message.reply(
        "<:scrubred:797476323169533963> You are not a bot owner. Stop.\nThis can allow people to tamper with me."
      );
    }

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> You didn't initialize the console properly. Try again by typing a command."
      );

    message.channel.send("```Waiting for the Terminal's output...```");
    process.exec(args, (error, stdout) => {
      const result = stdout || error;
      message.channel
        .send(result, {
          code: "asciidoc",
          split: "\n",
        })
        .catch((err) => {
          message.reply(
            `The terminal has encountered some error.\n\`\`\`${err}\`\`\``
          );
        });
    });
  }
};
