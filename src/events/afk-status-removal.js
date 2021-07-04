const Discord = require("discord.js");
const afkSchema = require("../models/afk-schema");

const { red, yellow, green } = require("../assets/json/colors.json");

module.exports = {
  name: "message",
  async execute(message) {
    if (message.channel.type === "dm") return;
    const guildId = message.guild.id;
    if (message.author.bot) return;
    const afkResults = await afkSchema.findOne({
      guildId,
      userId: message.author.id,
    });

    if (afkResults) {
      const { userId, timestamp, username, pingCount } = afkResults;

      if (message.author.id === userId) {
        if (timestamp + 1000 * 30 >= new Date().getTime()) return;

        await afkSchema.findOneAndDelete({
          guildId,
          userId: message.author.id,
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
            break;
          case 1:
            afkRemovalEmbed
              .setColor(yellow)
              .setDescription(
                `${defaultMsg}\n\`You've been directly pinged one time.\``
              )
              .setFooter("hmmmmm");
            break;
          default:
            afkRemovalEmbed
              .setColor(red)
              .setDescription(
                `${defaultMsg}\n\`You've been directly pinged ${pingCount} times.\``
              )
              .setFooter("two times or higher isn't good");
            break;
        }

        message.channel.send(afkRemovalEmbed);
      } else return;
    }
  },
};
