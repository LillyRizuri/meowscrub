const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["setsuggestion", "setsuggest"],
  memberName: "setsuggestion",
  group: "settings",
  description: "Set a suggestion logging channel for this server.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "<#channel | channelID>",
  examples: ["setsuggestion #suggestions", "setsuggestion disable"],
  userPermissions: ["MANAGE_GUILD"],
  singleArgs: true,
  cooldown: 3,
  guildOnly: true,
  callback: async (client, message, args) => {
    const guildId = message.guild.id;
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args);

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
              "settings.suggestionChannel": channel.id,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );

        message.channel.send(
          emoji.successEmoji + ` **Set the Suggestion Channel to:** ${channel}`
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
              "settings.suggestionChannel": null,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );

        message.channel.send(
          emoji.successEmoji +
            " **Removed the configuration for the Suggestion Channel.**"
        );
        return;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.suggestionChannel)
          return message.reply(
            emoji.missingEmoji + " The text channel hasn't been set yet."
          );
        else if (results && results.settings.suggestionChannel)
          message.channel.send(
            emoji.successEmoji +
              ` **Current Suggestion Channel Configuration:** <#${results.settings.suggestionChannel}>`
          );
        break;
      }
    }
  },
};
