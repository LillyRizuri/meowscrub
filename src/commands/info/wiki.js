const Discord = require("discord.js");
const fetch = require("node-fetch");

const util = require("../../util/util");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["wiki", "wikipedia", "wikia", "wikip"],
  group: "info",
  memberName: "wiki",
  description: "Search for a Wikipedia entry.",
  format: "<searchString>",
  examples: ["wikipedia vietnam", "wikipedia phone"],
  clientPermissions: ["EMBED_LINKS"],
  singleArgs: true,
  cooldown: 5,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(emoji.missingEmoji + " Type in a search query now.");

    const input = encodeURIComponent(args);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${input}`;

    const response = await fetch(url).then((res) => res.json());

    try {
      const wikiEmbed = new Discord.MessageEmbed()
        .setColor("#FAFAFA")
        .setAuthor(
          "Wikipedia",
          "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
        )
        .setTitle(response.title)
        .setURL(response.content_urls.desktop.page);

      if (response.type === "disambiguation") {
        wikiEmbed.setDescription(
          util.trim(response.extract, 3072) +
            `\n\n[${response.title} also refers to...](${response.content_urls.desktop.page})`
        );
      } else {
        wikiEmbed
          .setThumbnail(response.thumbnail.source)
          .setDescription(util.trim(response.extract, 4096));
      }

      message.channel.send({ embeds: [wikiEmbed] });
    } catch (err) {
      message.reply(
        emoji.denyEmoji +
          " That search query brings no result. Please try again with another one."
      );
    }
  },
};
