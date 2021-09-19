const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["dmpunishment", "dmwarn"],
  memberName: "dmpunishment",
  group: "settings",
  description:
    "Toggle this function when you want members to receive DM regards of their punishment status.",
  // eslint-disable-next-line quotes
  details: 'This includes: "ban, kick, mute, unmute, warn, delwarn"',
  userPermissions: ["MANAGE_GUILD"],
  cooldown: 3,
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

      message.channel.send(
        emoji.successEmoji + " Toggled `dmPunishment` to **Enabled**."
      );
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

      message.channel.send(
        emoji.successEmoji + " Toggled `dmPunishment` to **Disabled**."
      );
    }
  },
};
