const utf8 = require("utf8");
const base64 = require("base-64");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["base64"],
  memberName: "base64",
  group: "misc",
  description: "Convert your text to Base64 and vice versa.",
  details: "All text output will be encoded in UTF-8.",
  format: '<"encode" | "decode"> <string>',
  examples: [
    "base64 encode never gonna give you up",
    "base64 decode bmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXA=",
  ],
  cooldown: 5,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji +
          " The parameter is blank.\nEither you need to `encode`, or `decode`."
      );

    if (!args[1])
      return message.reply(
        emoji.missingEmoji + " I can't do anything without some text."
      );

    const param = args[0].toLowerCase();
    const input = args.slice(1).join(" ");

    let result = "";
    switch (param) {
      case "encode": {
        const formattedInput = utf8.encode(input);
        const encoded = base64.encode(formattedInput);

        if (encoded.length > 2000)
          return message.reply(
            emoji.denyEmoji + " Your provided input is probably too much."
          );

        result = encoded;
        break;
      }
      case "decode": {
        const decoded = base64.decode(input);
        const formattedOutput = utf8.decode(decoded);

        if (formattedOutput.length > 2000)
          return message.reply(
            emoji.denyEmoji + " Your provided input is probably too much."
          );

        result = formattedOutput;
        break;
      }
      default:
        return message.reply(
          emoji.denyEmoji +
            " That's NOT a valid parameter.\nEither it's by `encode`, or `decode`."
        );
    }

    message.channel.send(`\`\`\`\n${result}\n\`\`\``);
  },
};
