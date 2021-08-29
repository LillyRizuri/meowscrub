const Discord = require("discord.js");
const { pagination } = require("reconlx");

const util = require("../../util/util");

const emoji = require("../../assets/json/tick-emoji.json");

const tagsSchema = require("../../models/tags-schema");

module.exports = {
  aliases: ["tags", "all-tags", "tags-list"],
  memberName: "tags",
  group: "tags",
  description: "List all custom commands in the current server.",
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message) => {
    const results = await tagsSchema.findOne({
      guildId: message.guild.id,
    });

    let tagsList = "";

    if (!results || !results.tags || results.tags.length === 0)
      tagsList = "There's nothing here :(";
    else
      tagsList = results.tags
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((tag, i) => `#${i + 1} • ${tag.name}`)
        .join("\n");

    const listSplit = util.splitString(tagsList, 10);

    const embeds = [];
    for (let i = 0; i < listSplit.length; i++) {
      const tagsEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`All tags in ${message.guild.name}`)
        .setDescription(`\`\`\`css\n${listSplit[i]}\`\`\``)
        .setFooter("tags good");
      embeds.push(tagsEmbed);
    }

    pagination({
      embeds: embeds,
      author: message.author,
      channel: message.channel,
      fastSkip: true,
      time: 60000,
      button: [
        {
          name: "first",
          emoji: emoji.firstEmoji,
          style: "PRIMARY",
        },
        {
          name: "previous",
          emoji: emoji.leftEmoji,
          style: "PRIMARY",
        },
        {
          name: "next",
          emoji: emoji.rightEmoji,
          style: "PRIMARY",
        },
        {
          name: "last",
          emoji: emoji.lastEmoji,
          style: "PRIMARY",
        },
      ],
    });
  },
};
