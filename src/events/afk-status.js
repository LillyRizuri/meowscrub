const moment = require("moment");
const afkSchema = require("../models/afk-schema");

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

        let user = message.guild.members.cache.get(userId).user;
        message.channel.send(
          `${user.username} is currently AFK: ${afk} - ${moment(
            timestamp
          ).fromNow()}`
        );
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

        const defaultMsg = `Welcome back, <@${userId}>, I removed your AFK status.`;
        await message.member.setNickname(`${username}`).catch((err) => {});

        switch (pingCount) {
          case 0:
            message.channel.send(
              `${defaultMsg}\nYou haven't been directly pinged.`
            );
            return;
          case 1:
            message.channel.send(
              `${defaultMsg}\nYou've been directly pinged one time.`
            );
            return;
          default:
            message.channel.send(
              `${defaultMsg}\nYou've been directly pinged ${pingCount} times.`
            );
            return;
        }
      }
    }
  }
};
