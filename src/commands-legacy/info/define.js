const Discord = require("discord.js");
const lexico = require("lexico-dictionary");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["define", "dictionary", "df", "d"],
  memberName: "define",
  group: "info",
  description: "Search for an English word's definition using Lexico.",
  format: "<searchString>",
  examples: ["dictionary computer"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  singleArgs: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " There's no word for me to define."
      );

    try {
      message.channel.send("**🔍 Please wait... This will take a while...**");
      const results = await lexico.search(args.trim().toLowerCase());
      const meanings = results.meanings.slice(0, 5);
      const examples = results.examples
        .filter((name) => name.split("‘").join(" ") !== name)
        .slice(0, 5);

      if (JSON.stringify(meanings) !== JSON.stringify(results.meanings))
        meanings.push({ value: "*And more...*" });

      if (JSON.stringify(examples) !== JSON.stringify(results.examples))
        examples.push("*And more...*");

      let stringMeanings = "";

      let stringExamples = "";

      for (let i = 0; i < meanings.length; i++) {
        let type = `*[${meanings[i].type}]*`;
        if (
          meanings[i].type === "n/a" ||
          typeof meanings[i].type === "undefined"
        )
          type = "";
        stringMeanings += `\n• ${type} ${meanings[i].value}`;
      }

      for (let i = 0; i < examples.length; i++) {
        stringExamples += `\n• ${examples[i]}`;
      }

      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`Definiton for: ${results.url.split("/").slice(-1)[0]}`)
        .setURL(results.url)
        .setDescription(`**${results.pos}**`)
        .addFields(
          {
            name: "Phonetic",
            value: `[${results.phonetic}](${results.audio} "Pronunciation Audio")`,
            inline: true,
          },
          {
            name: "Origin",
            value: results.origin,
            inline: true,
          }
        )
        .setFooter("www.lexico.com - powered by oxford & dictionary.com")
        .setTimestamp();

      if (meanings.length > 0)
        embed.addFields({
          name: "Meaning(s)",
          value: stringMeanings,
        });

      if (examples.length > 0)
        embed.addFields({
          name: "Example(s)",
          value: stringExamples,
        });

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      message.reply(
        emoji.denyEmoji + " Your search query brings no results. Try again."
      );
    }
  },
};
