const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const utf8 = require("utf8");

module.exports = class WikipediaCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "wikipedia",
      aliases: ["wiki", "wikia", "wikip"],
      group: "conventional",
      memberName: "wikipedia",
      argsType: "single",
      description: "Search for a Wikipedia entry.",
      format: "<query>",
      examples: ["wikipedia vietnam"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
    const input = encodeURIComponent(args);
    const trim = (str, max) =>
      str.length > max ? `${str.slice(0, max - 3)}...` : str;

    const url = utf8.encode(`https://en.wikipedia.org/api/rest_v1/page/summary/${input}`);
    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> Please input a query to let me search for your stuff."
      );

    let response;

    try {
      response = await fetch(url).then((res) => res.json());
    } catch (err) {
      message.reply(
        "An error from the other side has occured. Please try again later."
      );
    }

    try {
      if (response.type === "disambiguation") {
        const tooManyResultsEmbed = new Discord.MessageEmbed()
          .setColor("#FAFAFA")
          .setAuthor(
            "Wikipedia",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
          )
          .setTitle(response.title)
          .setURL(response.content_urls.desktop.page).setDescription(`
${trim(response.extract, 1024)}
[${response.title} also refers to...](${response.content_urls.desktop.page})`);
        message.channel.send(tooManyResultsEmbed);
      } else {
        const definedEmbed = new Discord.MessageEmbed()
          .setColor("#FAFAFA")
          .setAuthor(
            "Wikipedia",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
          )
          .setTitle(response.title)
          .setURL(response.content_urls.desktop.page)
          .setThumbnail(response.thumbnail.source)
          .setDescription(trim(response.extract, 2048));
        message.channel.send(definedEmbed);
      }
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> That search query is trash. Sigh."
      );
    }
  }
};
