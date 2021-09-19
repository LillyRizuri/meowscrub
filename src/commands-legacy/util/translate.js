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
  cooldown: 3,
  singleArgs: true,
  callback: async (client, message, args) => {
    let textToTranslate = "";
    let translateTo = "en";
    if (args.split(/\s+/)[0].startsWith("-")) {
      textToTranslate = args.replace(args.split(/\s+/)[0], "");
      translateTo = args.split(/\s+/)[0].replace("-", "");
    } else if (!args[0].startsWith("-")) {
      textToTranslate = args;
    }

    if (!textToTranslate)
      return message.reply(
        emoji.missingEmoji +
          " You have to provide some input for me to translate."
      );

    if (!translateTo)
      return message.reply(
        emoji.denyEmoji +
          " There's no specified language that you want your text to be translated to."
      );

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
          name: "Text",
          value: textToTranslate,
          inline: true,
        },
        {
          name: "Translation",
          value: output.text,
          inline: true,
        }
      )
      .setFooter("translate.google.com")
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
