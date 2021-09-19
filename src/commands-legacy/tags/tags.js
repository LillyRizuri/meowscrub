const Discord = require("discord.js");

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
        .map((tag) => `\`${tag.name}\``)
        .join(" ");

    const tagsEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(`All tags in ${message.guild.name}`, message.guild.iconURL())
      .setDescription(tagsList);

    message.channel.send({ embeds: [tagsEmbed] });
  },
};
