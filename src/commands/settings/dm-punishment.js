const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const color = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["dmpunishment", "dmwarn"],
  memberName: "dmpunishment",
  group: "settings",
  description:
    "Toggle this function when you want members to receive DM regards of their punishment status.",
  // eslint-disable-next-line quotes
  details: 'This includes: "ban, kick, mute, unmute, warn, delwarn"',
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["ADMINISTRATOR"],
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message) => {
    const guildId = message.guild.id;

    const results = await settingsSchema.findOne({
      guildId,
    });

    if (!results || !results.settings.dmPunishment) {
      await settingsSchema.findOneAndUpdate(
        {
          guildId,
        },
        {
          guildId,
          $set: {
            "settings.dmPunishment": true,
          },
        }
      );

      const confirmationEmbed = new Discord.MessageEmbed()
        .setColor(color.green)
        .setDescription(
          emoji.successEmoji + " Toggled `dmPunishment` to **Enabled**."
        );
      message.channel.send({ embeds: [confirmationEmbed] });
    } else if (results && results.settings.dmPunishment) {
      await settingsSchema.findOneAndUpdate(
        {
          guildId,
        },
        {
          guildId,
          $set: {
            "settings.dmPunishment": false,
          },
        }
      );

      const confirmationEmbed = new Discord.MessageEmbed()
        .setColor(color.green)
        .setDescription(
          emoji.successEmoji + " Toggled `dmPunishment` to **Disabled**."
        );
      message.channel.send({ embeds: [confirmationEmbed] });
    }
  },
};
