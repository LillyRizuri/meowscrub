const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const process = require("child_process");

const { red, what } = require("../../assets/json/colors.json");

module.exports = class AvatarCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "console",
      aliases: ["shell", "terminal"],
      group: "utility",
      memberName: "console",
      description: "Run the bot's own terminal.",
      details: "Only the bot owner(s) may use this command.",
      argsType: "single",
      format: "<input>",
      // guarded: true
    });
  }

  run(message, args) {
    if (message.author.id !== process.env.OWNERID) {
      return message.reply(
        "<:scrubnull:797476323533783050> You are not a bot owner. Stop.\nThis can allow people to tamper with me."
      );
    }

    message.channel.send(`\`\`\`Initializing the Terminal...\`\`\``);
    process.exec(args, (error, stdout) => {
      let result = stdout || error;
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
