const Commando = require("discord.js-commando");
const figlet = require("figlet");

module.exports = class AsciiCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "ascii",
      group: "funs",
      memberName: "ascii",
      description:
        "Create an ASCII art using text. Won't look pretty on mobile though.",
      argsType: "single",
      format: "<string>",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
    const input = args;

    if (!input)
      return message.reply(
        "<:scrubnull:797476323533783050> Input some texts to advance."
      );

    if (input.length > 20)
      return message.reply(
        "<:scrubred:797476323169533963> Exceeding the 20 characters limit can be... **Dangerous.**"
      );

    figlet.text(
      args,
      {
        font: "",
      },
      async (err, data) => {
        if (err)
          return message.reply(
            `An error from the dependency has occured. \`${err}\``
          );
        if (!data)
          return message.channel.send(
            "```No Output. Please Try Again.```"
          );
        message.channel.send(`\`\`\`\n${data}\n\`\`\``);
      }
    );
  }
};
