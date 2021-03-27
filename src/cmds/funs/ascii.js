const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const figlet = require("figlet");

const { what, red } = require("../../assets/json/colors.json");

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
    });
  }

  async run(message, args) {
    const input = args;

    if (!input) {
      const noInputEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> Input some texts to advance."
        )
        .setFooter("it's not ascii when there isn't text")
        .setTimestamp();
      return message.reply(noInputEmbed);
    }

    if (input.length > 20) {
      const inputOverLimitEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> Exceeding the 20 characters limit can be... **Dangerous.**"
        )
        .setFooter("for legal reasons")
        .setTimestamp();
      return message.reply(inputOverLimitEmbed);
    }

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
            `\`\`\`No Output. Please Try Again.\`\`\``
          );
        message.channel.send(`\`\`\`${data}\`\`\``);
      }
    );
  }
};
