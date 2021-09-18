const Discord = require("discord.js");
const { parse } = require("twemoji-parser");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["emoji", "steal-emoji", "e"],
  memberName: "emoji",
  group: "util",
  description: "Extract your specified custom emoji from a server.",
  format: "<emojiName>",
  examples: ["emoji :what:"],
  clientPermissions: ["ATTACH_FILES"],
  cooldown: 5,
  singleArgs: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " Specify one emoji in order to advance."
      );

    let attachment;

    const parsedEmoji = Discord.Util.parseEmoji(args);
    if (parsedEmoji.id) {
      const extension = parsedEmoji.animated ? ".gif" : ".png";
      const url = `https://cdn.discordapp.com/emojis/${
        parsedEmoji.id + extension
      }`;

      attachment = new Discord.MessageAttachment(url);
    } else {
      const parsed = parse(args, { assetType: "png" });
      if (!parsed[0])
        return message.reply(
          emoji.denyEmoji + " Invalid emoji found. Try again."
        );

      attachment = new Discord.MessageAttachment(parsed[0].url);
    }

    message.channel.send({ content: `Extracted the emoji! \`${args}\``, files: [attachment] });
  },
};
