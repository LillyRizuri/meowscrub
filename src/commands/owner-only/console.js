const process = require("child_process");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["console", "shell", "terminal"],
  memberName: "console",
  group: "owner-only",
  description: "Run the bot's own terminal.",
  details: "Only the bot owner(s) may use this command.",
  format: "<string>",
  examples: ["console node -v"],
  singleArgs: true,
  ownerOnly: true,
  hidden: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji +
          " You didn't initialize the console properly. Try again by typing a command."
      );

    const msg = await message.channel.send(
      "```\nWaiting for the Terminal's output...\n```"
    );
    process.exec(args, (error, stdout) => {
      const result = stdout || error;

      msg
        .edit(
          `*Executed in ${
            (msg.editedTimestamp || msg.createdTimestamp) -
            (message.editedTimestamp || message.createdTimestamp)
          }ms.*\n\`\`\`\n${result.toString()}\n\`\`\``
        )
        .catch((err) => {
          message.reply(
            `The terminal has encountered some error.\n\`\`\`${err}\`\`\``
          );
        });
    });
  },
};
