const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const warnSchema = require("../../models/warn-schema");
const settingsSchema = require("../../models/settings-schema");

const { green } = require("../../assets/json/colors.json");

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
      clientPermissions: ["EMBED_LINKS"],
      userPermissions: ["BAN_MEMBERS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
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
        (await this.client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> THAT'S not a valid user."
      );
    }

    const member = message.guild.members.cache.get(target.id);

    if (message.guild.members.resolve(target.id)) {
      if (
        message.member.roles.highest.position <=
          member.roles.highest.position &&
        message.guild.ownerID !== message.author.id
      )
        return message.reply(
          `<:scrubred:797476323169533963> You are not allowed to interact with **${target.tag}**.`
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

    const warnId = "_" + Math.random().toString(36).substr(2, 9);

    args.shift();

    const guildId = message.guild.id;
    const userId = target.id;
    const reason = args.join(" ");

    if (!reason)
      return message.reply(
        `<:scrubnull:797476323533783050> State why do you want to warn ${target.tag}.`
      );

    if (reason.length > 128)
      return message.reply(
        "<:scrubred:797476323169533963> The reason for warning musn't be more than 128 characters."
      );

    const warning = {
      author: message.author.tag,
      authorId: message.author.id,
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

    if (message.guild.members.resolve(target.id)) {
      const guildSettings = await settingsSchema.findOne({
        guildId,
      });

      if (guildSettings && guildSettings.settings.dmPunishment) {
        const dmReasonEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`You got warned in ${message.guild.name}.`)
          .addFields(
            {
              name: "Performed By",
              value: `${message.author.tag} (${message.author.id})`,
            },
            {
              name: "Reason for Warning",
              value: `ID: ${warnId} - ${reason}`,
            }
          )
          .setFooter("Hmmm...")
          .setTimestamp();
        await member.send(dmReasonEmbed).catch(() => {
          message.channel.send(
            "Can't send the reason to the target. Maybe they have their DM disabled."
          );
        });
      }
    }

    const warnedEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `
<:scrubgreen:797476323316465676> **${target.tag}** has been warned for this following reason:
\`${reason}\`
        `
      )
      .setFooter(`WarnID: ${warnId}`)
      .setTimestamp();
    message.channel.send(warnedEmbed);
  }
};
