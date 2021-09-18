const utf8 = require("utf8");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["binary"],
  memberName: "binary",
  group: "misc",
  description: "Convert your text to binaries and vice versa.",
  details: "All text output will be encoded in UTF-8.",
  format: '<"encode" | "decode"> <string>',
  examples: [
    "binary never",
    "binary decode 01101110 01100101 01110110 01100101 01110010",
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

    function encode(char) {
      return char
        .split("")
        .map((str) => {
          const encoded = str.charCodeAt(0).toString(2);
          return encoded.padStart(8, "0");
        })
        .join(" ");
    }

    function decode(char) {
      return char
        .split(" ")
        .map((str) => String.fromCharCode(Number.parseInt(str, 2)))
        .join("");
    }

    let result = "";
    switch (param) {
      case "encode": {
        const formattedInput = utf8.encode(input);
        const encoded = encode(formattedInput);

        if (encoded.length > 2000)
          return message.reply(
            emoji.denyEmoji + " Your provided input is probably too much."
          );

        result = encoded;
        break;
      }
      case "decode": {
        const decoded = decode(input);
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
