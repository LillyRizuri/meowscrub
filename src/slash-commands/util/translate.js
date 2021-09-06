const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const translate = require("@iamtraction/google-translate");

const languages = require("../../assets/json/languages.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Translate your provided input to English.")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("The provided input to translate")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription(
          "The language that you want your text to be translated to"
        )
    ),
  group: "util",
  details:
    "The default language configuration is English, but you can find more supported languages by using the `list-lang` command.",
  examples: ["translate en xin chào", "translate vi hello", "translate hola"],
  callback: async (client, interaction) => {
    const textToTranslate = interaction.options.getString("string");
    let translateTo = "en";

    if (interaction.options.getString("language"))
      translateTo = interaction.options.getString("language");

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

    interaction.reply({ embeds: [embed] });
  },
};
