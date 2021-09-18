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

module.exports = {
  aliases: ["8ball"],
  memberName: "8ball",
  group: "funs",
  description: "Ask the 8-ball.",
  cooldown: 5,
  singleArgs: true,
  callback: async (client, message, args) => {
    if (!args) {
      message.reply(
        `🎱 | Specify a question first, **${message.author.username}**.`
      );
      return;
    }

    const answer = responses[Math.floor(Math.random() * responses.length)];
    message.reply(`🎱 | ${answer}, **${message.author.username}**.`);
  },
};
