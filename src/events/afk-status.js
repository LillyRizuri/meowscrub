const Discord = require("discord.js");
const moment = require("moment");
const afkSchema = require("../models/afk-schema");

const { red, green } = require("../assets/json/colors.json");

module.exports = async (client, message) => {
  const guildId = message.guild.id;
  if (message.author.bot) return;
  if (message.mentions.members.first()) {
    if (message.mentions.members.first().id === message.author.id) return;
    let results = await afkSchema.find({
      guildId,
    });

    for (let i = 0; i < results.length; i++) {
      let { userId, afk, timestamp, pingCount } = results[i];

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
          .setColor(red)
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
    let afkResults = await afkSchema.find({
      guildId,
    });

    for (let i = 0; i < afkResults.length; i++) {
      let { userId, timestamp, username, pingCount } = afkResults[i];

      if (timestamp + 1000 * 30 >= new Date().getTime()) return;

      if (message.author.id === userId) {
        await afkSchema.findOneAndDelete({
          guildId,
          userId,
        });

        const user = message.guild.members.cache.get(userId).user;
        const afkRemovalEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setTimestamp();
        const defaultMsg = `**Welcome back ${user.tag}, I removed your AFK status.**`;
        await message.member.setNickname(`${username}`).catch((err) => {});

        switch (pingCount) {
          case 0:
            afkRemovalEmbed
              .setDescription(
                `${defaultMsg}\n\`You haven't been directly pinged.\``
              )
              .setFooter("nice");
            message.channel.send(afkRemovalEmbed);
            return;
          case 1:
            afkRemovalEmbed
              .setDescription(
                `${defaultMsg}\n\`You've been directly pinged one time.\``
              )
              .setFooter("hmmmmm");
            message.channel.send(afkRemovalEmbed);
            return;
          default:
            afkRemovalEmbed
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
