const Discord = require("discord.js");
const fetch = require("node-fetch");

const { trim } = require("../../util/modules");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["wikipedia", "wiki", "wikia", "wikip"],
  group: "info",
  memberName: "wikipedia",
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

    let response;

    try {
      response = await fetch(url).then((res) => res.json());
    } catch (err) {
      message.reply(
        "An error from the other side has occured. Please try again later."
      );
    }
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
          trim(response.extract, 3072) +
            `\n\n[${response.title} also refers to...](${response.content_urls.desktop.page})`
        );
      } else {
        wikiEmbed
          .setThumbnail(response.thumbnail.source)
          .setDescription(trim(response.extract, 4096));
      }

      message.channel.send({ embeds: [wikiEmbed] });
    } catch (err) {
      return message.reply(
        emoji.denyEmoji +
          " That search query brings no result. Please try again with another one."
      );
    }
  },
};
