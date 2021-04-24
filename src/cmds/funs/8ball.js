const Commando = require("discord.js-commando");

const responses = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes – definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don’t count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];

module.exports = class rpsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "8ball",
      group: "funs",
      memberName: "8ball",
      argsType: "single",
      description: "Ask the 8-ball.",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message, args) {
    const question = args;
    if (!question) {
      message.channel.send(
        `🎱 | Specify a question first, **${message.author.username}**.`
      );
      return;
    }

    const answer = responses[Math.floor(Math.random() * responses.length)];
    message.channel.send(`🎱 | ${answer}, **${message.author.username}**.`);
  }
};
