const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const lexico = require("lexico-dictionary");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("define")
    .setDescription("Search for an English word's definition using Lexico.")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("The specified word")
        .setRequired(true)
    ),
  group: "info",
  examples: ["dictionary computer"],
  clientPermissions: ["EMBED_LINKS"],
  callback: async (client, interaction) => {
    const args = interaction.options.getString("search-string");
    try {
      interaction.reply("**🔍 Please wait... This will take a while...**");
      const results = await lexico.search(args.trim().toLowerCase());
      const pos = results.pos.split(" ");
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
        .setDescription(
          `**${pos[0].toProperCase()} ${pos.slice(1).join(" ")}**`
        )
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

      interaction.channel.send({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({
        content:
          emoji.denyEmoji + " Your search query brings no results. Try again.",
        ephemeral: true,
      });
    }
  },
};
