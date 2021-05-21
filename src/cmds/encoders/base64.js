/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const utf8 = require("utf8");
const base64 = require("base-64");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class Base64Command extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "base64",
      group: "encoders",
      memberName: "base64",
      description: "To Base64. And reverse.",
      details: "All text output will be encoded in UTF-8.",
      argsType: "multiple",
      format: "<encode/decode> <string>",
      examples: [
        "base64 encode never gonna give you up",
        "base64 decode bmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXA=",
      ],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> The parameter is blank.\nEither you need to `encode`, or `decode`."
      );

    if (!args[1])
      return message.reply(
        "<:scrubnull:797476323533783050> I can't do anything without some text."
      );

    const param = args[0].toLowerCase();
    const input = args.slice(1).join(" ");

    switch (param) {
      case "encode":
        const formattedInput = utf8.encode(input);
        const encoded = base64.encode(formattedInput);

        if (encoded.length > 2042)
          return message.reply(
            "<:scrubred:797476323169533963> Your provided input is probably too much."
          );

        const encodedEmbed = new Discord.MessageEmbed()
          .setColor(embedcolor)
          .setAuthor("Encoded to:")
          .setDescription(`\`\`\`${encoded}\`\`\``)
          .setTimestamp();
        message.channel.send(encodedEmbed);
        return;
      case "decode":
        const decoded = base64.decode(input);
        const formattedOutput = utf8.decode(decoded);

        if (formattedOutput.length > 2042)
          return message.reply(
            "<:scrubred:797476323169533963> Your provided input is probably too much."
          );

        const decodedEmbed = new Discord.MessageEmbed()
          .setColor(embedcolor)
          .setAuthor("Decoded to:")
          .setDescription(`\`\`\`${formattedOutput}\`\`\``)
          .setTimestamp();
        message.channel.send(decodedEmbed);
        return;
      default:
        return message.reply(
          "<:scrubred:797476323169533963> THAT'S not a valid parameter.\nEither it's by `encode`, or `decode`."
        );
    }
  }
};
