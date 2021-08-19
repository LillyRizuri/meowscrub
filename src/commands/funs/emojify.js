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

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["emojify"],
  memberName: "emojify",
  group: "funs",
  description: "Emoji-ify your text!",
  format: "<string>",
  cooldown: 5,
  singleArgs: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + "Provide some text in order for me to emojify it."
      );

    if (args.length > 20)
      return message.reply(
        emoji.denyEmoji + " Exceeding the 20 characters limit can be... **Dangerous.**"
      );

    message.channel.send(
      args
        .split("")
        .map((c) => mapping[c] || c)
        .join("")
    );
  },
};
