const ms = require("ms");

const util = require("../../util/util");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["slowmode", "cooldown"],
  memberName: "slowmode",
  group: "moderation",
  description: "Set cooldown for a channel.",
  details:
    "Leave the channel parameter blank to set a cooldown to the channel where the command was ran on.",
  format: "<time> [#channel/channelID]",
  examples: [
    "slowmode 10s #general",
    "slowmode 1m #vote",
    "slowmode 6h #test-lol",
    "slowmode 30s",
  ],
  clientPermissions: ["MANAGE_CHANNELS", "EMBED_LINKS"],
  userPermissions: ["MANAGE_CHANNELS"],
  cooldown: 3,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    let channel;
    if (!args[1]) {
      channel = message.channel;
    } else if (args[1]) {
      channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]);
      if (!channel)
        return message.reply(
          emoji.missingEmoji + " That's NOT a valid Channel ID."
        );
    }

    if (!args[0])
      return message.reply(
        emoji.missingEmoji +
          " What do you want the cooldown timer to be set to?\nPlease set the cooldown value with this format: `<number><s/m/h>`."
      );

    if (!util.endsWithAny(["s", "m", "h"], args[0].toLowerCase()))
      return message.reply(
        emoji.denyEmoji +
          " Your cooldown timer doesn't end with `s/m/h`. Try again."
      );

    const cooldownValue = ms(args[0]) / 1000;

    if (isNaN(cooldownValue))
      return message.reply(
        emoji.denyEmoji +
          " What the hell are you trying to do with that not-a-number value?"
      );

    if (cooldownValue < 0 || cooldownValue > 21600)
      return message.reply(
        emoji.denyEmoji +
          " The cooldown timer should be in-between 0 seconds and 6 hours."
      );

    try {
      await channel.setRateLimitPerUser(
        cooldownValue,
        `Operation done by ${message.author.tag}`
      );

      message.reply(
        emoji.successEmoji +
          ` Slowmode for ${channel} has been set to **${args[0].toLowerCase()}**.`
      );
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + "Huh. I can't set that channel's cooldown timer."
      );
    }
  },
};
