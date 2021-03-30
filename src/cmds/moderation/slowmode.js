const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { what, green, red } = require("../../assets/json/colors.json");

module.exports = class SlowModeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "slowmode",
      aliases: ["cooldown"],
      group: "moderation",
      memberName: "slowmode",
      description: "Set cooldown for a channel.",
      format: "<time> [#channel]",
      examples: ["slowmode 10 #general"],
      argsType: "multiple",
      clientPermissions: ["MANAGE_CHANNELS"],
      userPermissions: ["MANAGE_CHANNELS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[1]) ||
      message.channel;

    if (!args[0]) {
      const noTimeSetEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> What do you want the slowmode to be set to?"
        )
        .setFooter("otherwise no slowmode for you")
        .setTimestamp();
      message.reply(noTimeSetEmbed);
      return;
    }

    const cooldownValue = Number(args[0], 10);

    if (isNaN(cooldownValue)) {
      const notValidTimeEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> Breaking me using value like that? No."
        )
        .setFooter("heh.")
        .setTimestamp();
      message.reply(notValidTimeEmbed);
      return;
    }

    if (!Number.isInteger(cooldownValue)) {
      const notIntegerEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> Cooldown can't be applied if the value isn't an integer."
        )
        .setFooter("ya bafoon")
        .setTimestamp();
      message.reply(notIntegerEmbed);
      return;
    }

    if (args[0] < 0 || args[0] > 21600) {
      const notInBetweenEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> The cooldown value should be in-between 0 and 21600."
        )
        .setFooter("try again.")
        .setTimestamp();
      message.reply(notInBetweenEmbed);
      return;
    }

    channel.setRateLimitPerUser(
      args[0],
      `Operation done by ${message.author.tag}`
    );

    const slowModeOKEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Slowmode for ${channel} has been set to **${args[0]}** second(s).`
      )
      .setFooter("is this slowmode good enough")
      .setTimestamp();
    message.reply(slowModeOKEmbed);
  }
};
