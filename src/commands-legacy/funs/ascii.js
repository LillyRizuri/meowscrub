const figlet = require("figlet");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["ascii"],
  memberName: "ascii",
  group: "funs",
  description:
    "Create ASCII art using your input. Won't look pretty on mobile though.",
  format: "<string>",
  cooldown: 5,
  singleArgs: true,
  callback: async (client, message, args) => {
    function asciiText(text) {
      const result = figlet.textSync(text, { font: "" });
      return result;
    }

    if (!args) return message.channel.send(`\`\`\`\n${asciiText("No text.")}\n\`\`\``);

    if (args.length > 20)
      return message.reply(
        emoji.denyEmoji +
          " Exceeding the 20 characters limit can be... **Dangerous.**"
      );

    if (!asciiText(args))
      return message.reply(
        emoji.denyEmoji +
          " There's no output. Did you type in any special characters?"
      );

    message.channel.send(`\`\`\`\n${asciiText(args)}\n\`\`\``);
  },
};
