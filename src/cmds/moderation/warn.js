const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const mongo = require("../../mongo");
const warnSchema = require("../../models/warn-schema");

const { green, what, red } = require("../../assets/json/colors.json");

module.exports = class WarnCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "warn",
      aliases: ["strike"],
      group: "moderation",
      memberName: "warn",
      description: "Warn somebody.",
      argsType: "multiple",
      format: "<@user> [reason]",
      examples: ["warn @frockles spamming"],
      clientPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> At least provide at least one user to warn."
      );

    let target;

    try {
      target =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]).user;
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> THAT'S not a valid user."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> I won't allow you to warn yourself. That's stupid."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Explain why do I need to warn myself."
        );
    }

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> Warning a bot user is useless y'know."
      );

    var ID = function () {
      return "_" + Math.random().toString(36).substr(2, 9);
    };

    var warnId = ID();

    args.shift();

    const guildId = message.guild.id;
    const userId = target.id;
    const reason = args.join(" ");

    if (!reason)
      return message.reply(
        `<:scrubnull:797476323533783050> State why do you want to warn ${target.tag}.`
      );

    if (reason.length > 32)
      return message.reply(
        "<:scrubred:797476323169533963> The reason for warning musn't be more than 32 characters."
      );

    const warning = {
      author: message.member.user.tag,
      timestamp: new Date().getTime(),
      warnId,
      reason,
    };

    await warnSchema.findOneAndUpdate(
      {
        guildId,
        userId,
      },
      {
        guildId,
        userId,
        $push: {
          warnings: warning,
        },
      },
      {
        upsert: true,
      }
    );

    const warnedEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> **${target.tag}** has been warned.`
      )
      .setFooter(`WarnID: ${warnId}`)
      .setTimestamp();
    message.channel.send(warnedEmbed);
  }
};
