const Commando = require("discord.js-commando");
const { TicTacToe } = require("weky");

module.exports = class TicTacToeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "tictactoe",
      aliases: ["ttt"],
      group: "funs",
      memberName: "tictactoe",
      description: "Play some really simple tic-tac-toe.",
      format: "<@user>",
      examples: ["tictactoe @frockles"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  run(message) {
    const target = message.mentions.users.first();

    if (!target)
      return message.reply(
        "<:scrubnull:797476323533783050> Please request an user to play with you."
      );

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> You cannot play with bots. They can't respond."
      );

    if (target === message.author)
      return message.reply(
        "<:scrubred:797476323169533963> You can't be alone like that."
      );

    const tttGame = new TicTacToe({
      message: message,
      opponent: target,
      xColor: "red",
      oColor: "blurple",
      xEmoji: "❌",
      oEmoji: "0️⃣",
    });
    tttGame.start();
  }
};
