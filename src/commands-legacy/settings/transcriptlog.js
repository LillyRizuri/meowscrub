const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["transcriptlog", "settranscript"],
  memberName: "transcriptlog",
  group: "settings",
  description:
    "Set a channel for ticket transcript logging. Must have a ticket channel set up.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "<#channel | channelID>",
  examples: ["transcript-log #log", "transcript-log disable"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["MANAGE_GUILD"],
  singleArgs: true,
  cooldown: 3,
  guildOnly: true,
  callback: async (client, message, args) => {
    const guildId = message.guild.id;
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args);

    const guildSettings = await settingsSchema.findOne({
      guildId,
    });

    if (!guildSettings || !guildSettings.settings.ticketChannel.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You must have a ticket channel set up with the `setticket` command."
      );

    switch (args.toLowerCase()) {
      default: {
        if (!channel)
          return message.reply(
            emoji.missingEmoji +
              " No valid channel found for the configuration."
          );

        if (channel.type !== "GUILD_TEXT")
          return message.reply(
            emoji.denyEmoji + " It isn't a valid text channel."
          );

        if (!channel.viewable)
          return message.reply(
            emoji.denyEmoji + " I can't view your specified channel."
          );

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.transcriptLog": channel.id,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );

        message.channel.send(
          emoji.successEmoji +
            ` **Set the Transcript Log Channel to:** ${channel}`
        );
        break;
      }
      case "disable": {
        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.transcriptLog": null,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );

        message.channel.send(
          emoji.successEmoji +
            " **Removed the configuration for the Transcript Log Channel.**"
        );
        break;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.transcriptLog)
          return message.reply(
            emoji.missingEmoji + " The text channel hasn't been set yet."
          );
        else if (results && results.settings.transcriptLog)
          message.channel.send(
            emoji.successEmoji +
              ` **Current Transcript Log Channel Configuration:** <#${results.settings.transcriptLog}>`
          );
        break;
      }
    }
  },
};
