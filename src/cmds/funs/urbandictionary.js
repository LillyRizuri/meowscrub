const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const modules = require("../../modules");
const fetch = require("node-fetch");
const utf8 = require("utf8");

const { urbandictionary } = require("../../assets/json/colors.json");

module.exports = class DictionaryCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "urbandictionary",
      aliases: ["urban", "dictionary", "define", "df", "d"],
      group: "funs",
      memberName: "urbandictionary",
      argsType: "single",
      description:
        "Search a word within Urban Dictionary. Beware of inappropriate definitions.",
      format: "<string>",
      examples: ["urbandictionary cookie"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
    const input = encodeURIComponent(args);
    const url = utf8.encode(
      `https://api.urbandictionary.com/v0/define?term=${input}`
    );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> Erm, can you type something for the query, please?"
      );

    message.channel.send("Searching, I guess...");

    const { list } = await fetch(url).then((res) => res.json());

    try {
      const [answer] = list;

      const embed = new Discord.MessageEmbed()
        .setColor(urbandictionary)
        .setAuthor("Definition for:", "https://i.imgur.com/RFm5zMt.png")
        .setTitle(answer.word)
        // .setURL(answer.permalink)
        .setDescription(modules.trim(answer.definition, 2048))
        .addFields({
          name: "Example",
          value: modules.trim(answer.example, 1024),
        })
        .setFooter(
          `👍${answer.thumbs_up} | 👎${answer.thumbs_down} | Definition by ${answer.author}`
        )
        .setTimestamp();
      message.channel.send(embed);
    } catch (err) {
      message.reply(
        `<:scrubred:797476323169533963> No results for: **${args}**.`
      );
    }
  }
};
