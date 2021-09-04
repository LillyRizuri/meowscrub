const Discord = require("discord.js");
const translate = require("@iamtraction/google-translate");

const languages = require("../../assets/json/languages.json");

module.exports = {
  data: {
    name: "Translate Message",
    type: 3,
  },
  memberName: "translate-message",
  group: "context",
  callback: async (client, interaction) => {
    const textToTranslate = interaction.options.getMessage("message");

    const output = await translate(textToTranslate, { to: "en" });
    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle(
        `Translated from ${languages[output.from.language.iso]} to English`
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

    interaction.reply({ embeds: [embed] });
  },
};
