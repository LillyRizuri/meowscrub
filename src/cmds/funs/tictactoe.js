const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { tictactoe } = require("reconlx");

const { what, red } = require("../../assets/json/colors.json");

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
      guildOnly: true,
    });
  }

  run(message) {
    const member = message.mentions.users.first();

    if (!member)
      return message.reply(
        "<:scrubnull:797476323533783050> Please request an user to play with you."
      );

    if (member.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> You cannot play with bots. They can't respond."
      );

    if (member === message.author)
      return message.reply(
        "<:scrubred:797476323169533963> You can't be alone like that."
      );

    new tictactoe({
      player_two: member,
      message: message,
    });
  }
};
