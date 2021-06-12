const Commando = require("discord.js-commando");
const ms = require("ms");
const modules = require("../../modules");

module.exports = class SlowModeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "slowmode",
      aliases: ["cooldown"],
      group: "moderation",
      memberName: "slowmode",
      description: "Set cooldown for a channel.",
      details:
        "Leave the channel parameter blank to set a cooldown to the channel where the command was ran on.",
      format: "<number><s/m/h> [#channel/channelID]",
      examples: [
        "slowmode 10s #general",
        "slowmode 1m #vote",
        "slowmode 6h #test-lol",
        "slowmode 30s",
      ],
      argsType: "multiple",
      clientPermissions: ["MANAGE_CHANNELS", "EMBED_LINKS"],
      userPermissions: ["MANAGE_CHANNELS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    let channel;

    if (!args[1]) {
      channel = message.channel;
    } else if (args[1]) {
      channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[1]);
      if (!channel)
        return message.reply(
          "<:scrubnull:797476323533783050> That's NOT a valid Channel ID."
        );
    }

    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> What do you want the slowmode to be set to?\nPlease set the cooldown value with this format: `<number><s/m/h>`."
      );

    if (!modules.endsWithAny(["s", "m", "h"], args[0].toLowerCase()))
      return message.reply(
        "<:scrubred:797476323169533963> Your cooldown value doesn't end with `s/m/h`. Try again."
      );

    const cooldownValue = ms(args[0]) / 1000;

    if (isNaN(cooldownValue))
      return message.reply(
        "<:scrubred:797476323169533963> What the hell are you trying to do with that?"
      );

    if (cooldownValue < 0 || cooldownValue > 21600)
      return message.reply(
        "<:scrubred:797476323169533963> The cooldown value should be in-between 0 seconds and 6 hours."
      );

    try {
      await channel.setRateLimitPerUser(
        cooldownValue,
        `Operation done by ${message.author.tag}`
      );

      message.reply(
        `<:scrubgreen:797476323316465676> Slowmode for ${channel} has been set to **${args[0].toLowerCase()}**.`
      );
    } catch (err) {
      console.log(err);
    }
  }
};
