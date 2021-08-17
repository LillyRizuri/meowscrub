const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { parse } = require("twemoji-parser");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class StealEmojiCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "emoji",
      aliases: ["stealemoji", "e"],
      group: "misc",
      memberName: "emoji",
      description: "Extract your specified custom emoji from a guild.",
      argsType: "single",
      format: "<emojiname>",
      examples: ["emoji :what:"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message, args) {
    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> Specify one emoji to advance."
      );

    try {
      const parsedEmoji = Discord.Util.parseEmoji(args);
      if (parsedEmoji.id) {
        const extension = parsedEmoji.animated ? ".gif" : ".png";
        const url = `https://cdn.discordapp.com/emojis/${
          parsedEmoji.id + extension
        }`;
        const guildEmojiEmbed = new Discord.MessageEmbed()
          .setColor(embedcolor)
          .setImage(url)
          .setFooter(
            `Requested by ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          );
        message.channel.send(guildEmojiEmbed);
      } else {
        const parsed = parse(args, { assetType: "png" });
        if (!parsed[0]) {
          return message.reply(
            "<:scrubred:797476323169533963> Invalid emoji found. Try again."
          );
        }

        const builtInEmojiEmbed = new Discord.MessageEmbed()
          .setColor(embedcolor)
          .setImage(parsed[0].url)
          .setFooter(
            `Requested by ${message.author.tag}`,
            message.author.displayAvatarURL({ dynamic: true })
          );
        message.channel.send(builtInEmojiEmbed);
      }
    } catch (err) {
      message.reply("Something went wrong. Please try again now, or later.");
    }
  }
};
