const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { parse } = require("twemoji-parser");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Extract your specified custom emoji from a server.")
    .addStringOption((option) =>
      option
        .setName("emoji-name")
        .setDescription("The specified emoji")
        .setRequired(true)
    ),
  group: "util",
  examples: ["emoji :what:"],
  clientPermissions: ["ATTACH_FILES"],
  callback: async (client, interaction) => {
    const args = interaction.options.getString("emoji-name");
    let attachment;

    const parsedEmoji = Discord.Util.parseEmoji(args);
    if (parsedEmoji.id) {
      const extension = parsedEmoji.animated ? ".gif" : ".png";
      const url = `https://cdn.discordapp.com/emojis/${
        parsedEmoji.id + extension
      }`;

      attachment = new Discord.MessageAttachment(url);
    } else {
      const parsed = parse(args, { assetType: "png" });
      if (!parsed[0])
        return interaction.reply({
          content: emoji.denyEmoji + " Invalid emoji found. Try again.",
          ephemeral: true,
        });

      attachment = new Discord.MessageAttachment(parsed[0].url);
    }

    interaction.reply({
      content: `Extracted the emoji! \`${args}\``,
      files: [attachment],
    });
  },
};
