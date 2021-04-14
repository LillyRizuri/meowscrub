const Discord = require("discord.js");
const moment = require("moment");
const afkSchema = require("../models/afk-schema");

const { red, yellow, green, what } = require("../assets/json/colors.json");

module.exports = async (client, message) => {
  const guildId = message.guild.id;
  if (message.author.bot) return;
  if (message.mentions.members.first()) {
    if (message.mentions.members.first().id === message.author.id) return;
    const results = await afkSchema.find({
      guildId,
    });

    for (let i = 0; i < results.length; i++) {
      const { userId, afk, timestamp, pingCount } = results[i];

      if (message.mentions.members.first().id === userId) {
        await afkSchema.findOneAndUpdate(
          {
            guildId,
            userId,
          },
          {
            pingCount: pingCount + 1,
          },
          {
            upsert: true,
          }
        );

        const user = message.guild.members.cache.get(userId).user;
        const afkTimestamp = moment(timestamp).fromNow();
        const IsAfkEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setDescription(
            `**${user.tag} is currently AFK for the following reason:**\n\`"${afk}" - ${afkTimestamp}\``
          )
          .setFooter("don't disturb them again.")
          .setTimestamp();
        message.channel.send(IsAfkEmbed);
        return;
      }
    }
  } else {
    const afkResults = await afkSchema.find({
      guildId,
    });

    for (let i = 0; i < afkResults.length; i++) {
      const { userId, timestamp, username, pingCount } = afkResults[i];

      if (timestamp + 1000 * 30 >= new Date().getTime()) return;

      if (message.author.id === userId) {
        await afkSchema.findOneAndDelete({
          guildId,
          userId,
        });

        const user = message.guild.members.cache.get(userId).user;
        const afkRemovalEmbed = new Discord.MessageEmbed().setTimestamp();
        const defaultMsg = `**Welcome back ${user.tag}, I removed your AFK status.**`;
        // eslint-disable-next-line no-empty-function
        await message.member.setNickname(`${username}`).catch(() => {});

        switch (pingCount) {
          case 0:
            afkRemovalEmbed
              .setColor(green)
              .setDescription(
                `${defaultMsg}\n\`You haven't been directly pinged.\``
              )
              .setFooter("nice");
            message.channel.send(afkRemovalEmbed);
            return;
          case 1:
            afkRemovalEmbed
              .setColor(yellow)
              .setDescription(
                `${defaultMsg}\n\`You've been directly pinged one time.\``
              )
              .setFooter("hmmmmm");
            message.channel.send(afkRemovalEmbed);
            return;
          default:
            afkRemovalEmbed
              .setColor(red)
              .setDescription(
                `${defaultMsg}\n\`You've been directly pinged ${pingCount} times.\``
              )
              .setFooter("two times or higher isn't good");
            message.channel.send(afkRemovalEmbed);
            return;
        }
      }
    }
  }
};
