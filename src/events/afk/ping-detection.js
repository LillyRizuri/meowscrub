const Discord = require("discord.js");
const moment = require("moment");
const afkSchema = require("../../models/afk-schema");

const color = require("../../assets/json/colors.json");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message.guild) return;
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

              const afkUser = await client.users.fetch(userId);
              const afkTimestamp = moment(timestamp).fromNow();
              const IsAfkEmbed = new Discord.MessageEmbed()
                .setColor(color.what)
                .setDescription(
                  `**${afkUser.tag} is currently AFK for the following reason:**\n\`"${afk}" - ${afkTimestamp}\``
                )
                .setFooter("don't disturb them again.")
                .setTimestamp();
              message.channel.send({ embeds: [IsAfkEmbed] });
              return;
            }
          });
        }
      } else return;
      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
