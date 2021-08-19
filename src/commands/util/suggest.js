const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const checkMark = "<:scrubgreenlarge:797816509967368213>";
const cross = "<:scrubredlarge:797816510579998730>";
const qstnMark = "<:scrubnulllarge:797816510298324992>";

module.exports = {
  aliases: ["suggest", "suggestion", "idea"],
  memberName: "suggest",
  group: "util",
  description: "Suggest an idea for the server!",
  format: "<string>",
  examples: ["suggest implement a giveaway system"],
  clientPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "USE_EXTERNAL_EMOJIS"],
  cooldown: 15,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const guildId = message.guild.id;

    const results = await settingsSchema.findOne({
      guildId,
    });

    const channel = message.guild.channels.cache.get(
      results.settings.suggestionChannel
    );

    if (!channel)
      return message.reply(
        emoji.missingEmoji +
          " This server doesn't have any suggestion channel set up. Sorry."
      );

    if (!args)
      return message.reply(
        emoji.missingEmoji +
          " You need to suggest something before you advance."
      );

    if (args.length > 1000)
      return message.reply(
        emoji.denyEmoji +
          " Your suggestion content musn't have more than 1000 characters."
      );

    const embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(
        message.author.tag,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setDescription(args)
      .setFooter(`UserID: ${message.author.id}`)
      .setTimestamp();

    const msg = await channel.send({ embeds: [embed] });
    await message.reply(
      emoji.successEmoji + `Recorded your suggestion into **#${channel.name}**.`
    );

    await msg.react(checkMark);
    await msg.react(cross);
    await msg.react(qstnMark);
  },
};
