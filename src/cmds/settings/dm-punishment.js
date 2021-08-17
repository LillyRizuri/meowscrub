/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green } = require("../../assets/json/colors.json");

module.exports = class SetChatbotChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "dm-punishment",
      aliases: ["dm-warn"],
      group: "settings",
      memberName: "dm-punishment",
      description:
        "Toggle this function when you want members to receive DM regards of their punishment status.",
      details: "This includes: \"ban, kick, mute, unmute, warn, delwarn\"",
      userPermissions: ["ADMINISTRATOR"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
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
        .setColor(green)
        .setDescription(
          "<:scrubgreen:797476323316465676> Toggled `dmPunishment` to **Enabled**."
        );
      message.channel.send(confirmationEmbed);
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
        .setColor(green)
        .setDescription(
          "<:scrubgreen:797476323316465676> Toggled `dmPunishment` to **Disabled**."
        );
      message.channel.send(confirmationEmbed);
    }
  }
};
