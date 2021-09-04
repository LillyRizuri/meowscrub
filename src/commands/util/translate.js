const Discord = require("discord.js");
const translate = require("@iamtraction/google-translate");

const languages = require("../../assets/json/languages.json");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["translate", "translator"],
  memberName: "translate",
  group: "util",
  description: "Translate your provided input to English.",
  details:
    '"language" means the language that you want your text to be translated to. The default is English, but you can find more supported languages by using the `list-lang` command.',
  format: "[-language] <string>",
  examples: ["translate -en xin chào", "translate -vi hello", "translate hola"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " Please provide some text for me to translate."
      );

    let textToTranslate = "";
    let translateTo = "en";
    if (args[0].startsWith("-")) {
      textToTranslate = args.slice(1).join(" ");
      translateTo = args[0].replace("-", "");
    } else if (!args[0].startsWith("-")) {
      textToTranslate = args.slice(0).join(" ");
    }

    const output = await translate(textToTranslate, { to: translateTo });
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle(
        `Translated from ${languages[output.from.language.iso]} to ${
          languages[translateTo]
            ? languages[translateTo]
            : translateTo.toProperCase()
        }`
      )
      .addFields(
        {
          name: "From",
          value: `\`\`\`\n${textToTranslate}\n\`\`\``,
          inline: true,
        },
        {
          name: "To",
          value: `\`\`\`\n${output.text}\n\`\`\``,
          inline: true,
        }
      )
      .setFooter("translate.google.com")
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
