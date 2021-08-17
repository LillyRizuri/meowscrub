const Commando = require("discord.js-commando");
const mapping = {
  " ": "   ",
  0: ":zero:",
  1: ":one:",
  2: ":two:",
  3: ":three:",
  4: ":four:",
  5: ":five:",
  6: ":six:",
  7: ":seven:",
  8: ":eight:",
  9: ":nine:",
  "!": ":grey_exclamation:",
  "?": ":grey_question:",
  "#": ":hash:",
  "*": ":asterisk:",
};

"abcdefghijklmnopqrstuvwxyz".split("").forEach((c) => {
  mapping[c] = mapping[c.toUpperCase()] = `:regional_indicator_${c}:`;
});

module.exports = class EmojifyCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "emojify",
      group: "funs",
      memberName: "emojify",
      description: "Return provided text in emoji form.",
      argsType: "single",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message, args) {
    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> Provide some text in order to emojify it."
      );

    if (args.length > 20)
      return message.reply(
        "<:scrubred:797476323169533963> The argument can't be over 20 characters. Try again."
      );

    message.channel.send(
      args
        .split("")
        .map((c) => mapping[c] || c)
        .join("")
    );
  }
};
