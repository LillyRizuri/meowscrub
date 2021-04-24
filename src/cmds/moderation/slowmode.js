const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const ms = require("ms");

const { green } = require("../../assets/json/colors.json");

module.exports = class SlowModeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "slowmode",
      aliases: ["cooldown"],
      group: "moderation",
      memberName: "slowmode",
      description: "Set cooldown for a channel.",
      format: "<s/m/h> [#channel/channelID]",
      examples: [
        "slowmode 10s #general",
        "slowmode 1m #vote",
        "slowmode 6h #test-lol",
      ],
      argsType: "multiple",
      clientPermissions: ["MANAGE_CHANNELS"],
      userPermissions: ["MANAGE_CHANNELS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[1]) ||
      message.channel;

    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> What do you want the slowmode to be set to?\nPlease use the format: `s/m/h`."
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

      const slowModeOKEmbed = new Discord.MessageEmbed()
        .setColor(green)
        .setDescription(
          `<:scrubgreen:797476323316465676> Slowmode for ${channel} has been set to **${args[0]}**.`
        )
        .setFooter("is this slowmode good enough")
        .setTimestamp();
      message.reply(slowModeOKEmbed);
    } catch (err) {
      console.log(err);
    }
  }
};
