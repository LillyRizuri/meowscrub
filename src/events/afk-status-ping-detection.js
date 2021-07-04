const Discord = require("discord.js");
const moment = require("moment");
const afkSchema = require("../models/afk-schema");

const { what } = require("../assets/json/colors.json");

module.exports = {
  name: "message",
  async execute(message) {
    if (message.channel.type === "dm") return;
    try {
      const guildId = message.guild.id;
      if (message.author.bot) return;
      if (message.mentions.users.first()) {
        const results = await afkSchema.find({
          guildId,
        });

        for (let i = 0; i < results.length; i++) {
          const { userId, afk, timestamp, pingCount } = results[i];

          message.mentions.users.each(async (user) => {
            if (user.id === userId) {
              if (userId === message.author.id) return;
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

              const AFKuser = message.guild.members.cache.get(userId).user;
              const afkTimestamp = moment(timestamp).fromNow();
              const IsAfkEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(
                  `**${AFKuser.tag} is currently AFK for the following reason:**\n\`"${afk}" - ${afkTimestamp}\``
                )
                .setFooter("don't disturb them again.")
                .setTimestamp();
              message.channel.send(IsAfkEmbed);
              return;
            }
          });
        }
      } else return;
      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
