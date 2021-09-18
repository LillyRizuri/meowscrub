const Discord = require("discord.js");
const translate = require("@iamtraction/google-translate");

const languages = require("../../assets/json/languages.json");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: {
    name: "Translate Message",
    type: 3,
  },
  memberName: "translate-message",
  description: "Translate your provided input to English.",
  group: "context",
  callback: async (client, interaction) => {
    const textToTranslate = interaction.options.getMessage("message");

    if (!textToTranslate.content)
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " There's no message content in the chosen message.",
        ephemeral: true,
      });

    const output = await translate(textToTranslate.content, { to: "en" });
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle(
        `Translated from ${languages[output.from.language.iso]} to English`
      )
      .addFields(
        {
          name: "Text",
          value: textToTranslate.content,
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
