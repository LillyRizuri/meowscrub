const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const utf8 = require("utf8");

const { urbandictionary, what, red } = require("../../assets/json/colors.json");

module.exports = class DictionaryCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "urbandictionary",
      aliases: ["urban", "dictionary", "define", "df", "d"],
      group: "funs",
      memberName: "urbandictionary",
      argsType: "single",
      description:
        "Search a word within Urban Dictionary, not intended for serious stuff.",
      format: "<string>",
      examples: ["urbandictionary cookie"],
    });
  }

  async run(message, args) {
    const input = encodeURIComponent(args);

    if (!args) {
      const noResultsEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          `<:scrubnull:797476323533783050> Erm, can you type something in the search box, please?`
        )
        .setFooter("bluh")
        .setTimestamp();
      message.reply(noResultsEmbed);
      return;
    }

    message.channel.send("Searching, I guess...");

    const { list } = await fetch(
      utf8.encode(`https://api.urbandictionary.com/v0/define?term=${input}`)
    ).then((response) => response.json());

    try {
      const [answer] = list;
      const trim = (str, max) =>
        str.length > max ? `${str.slice(0, max - 3)}...` : str;

      const embed = new Discord.MessageEmbed()
        .setColor(urbandictionary)
        .setAuthor("Definition for:", "https://i.imgur.com/RFm5zMt.png")
        .setTitle(answer.word)
        // .setURL(answer.permalink)
        .setDescription(trim(answer.definition, 2048))
        .addFields({
          name: "Example",
          value: trim(answer.example, 1024),
        })
        .setFooter(
          `👍${answer.thumbs_up} | 👎${answer.thumbs_down} | Definition by ${answer.author}`
        )
        .setTimestamp();
      message.channel.send(embed);
    } catch (err) {
      const noResultsEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          `<:scrubred:797476323169533963> No results for: **${args}**.`
        )
        .setFooter("it doesn't exist alright")
        .setTimestamp();
      message.reply(noResultsEmbed);
      return;
    }
  }
};
