const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green } = require("../../assets/json/colors.json");

module.exports = class KickCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "kick",
      group: "moderation",
      memberName: "kick",
      description: "Kick a member in the current guild. Hmmmm...",
      argsType: "multiple",
      format: "<@user/userID> [reason]",
      examples: ["kick @frockles broken a rule"],
      clientPermissions: ["KICK_MEMBERS", "EMBED_LINKS"],
      userPermissions: ["KICK_MEMBERS"],
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
        "<:scrubnull:797476323533783050> Who do you want to kick? Get it right."
      );

    let reason;
    let target;

    try {
      target =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]).user;
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What is this ID. Explain or begone."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Kicking yourself? Why not leaving by yourself?"
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Kicking myself? What the..."
        );
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        "<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 200 characters."
      );

    if (args[1]) {
      reason = reasonMessage;
    } else {
      reason = "No reason provided.";
    }

    const { guild } = message;

    const member = guild.members.cache.get(target.id);
    if (
      message.member.roles.highest.position <= member.roles.highest.position &&
      message.guild.ownerID !== message.author.id
    )
      return message.reply(
        `<:scrubred:797476323169533963> You are not allowed to interact with **${target.tag}**.`
      );

    if (!member.kickable)
      return message.reply(
        "<:scrubred:797476323169533963> How the heck can I kick the user you specified? Jesus."
      );

    const guildSettings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (guildSettings && guildSettings.settings.dmPunishment) {
      const dmReasonEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`You were kicked in ${guild.name}.`)
        .addFields(
          {
            name: "Performed By",
            value: `${message.author.tag} (${message.author.id})`,
          },
          {
            name: "Reason for Kicking",
            value: reason,
          }
        )
        .setFooter("Well.")
        .setTimestamp();
      await member.send(dmReasonEmbed).catch(() => {
        message.channel.send(
          "Can't send the reason to the offender. Maybe they have their DM disabled."
        );
      });
    }

    await member.kick(`From ${message.author.tag}: ${reason}`);

    const kickConfirmEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Successfully kicked **${target.tag}**.`
      )
      .addFields(
        {
          name: "Performed By",
          value: `${message.author.tag} (${message.author.id})`,
        },
        {
          name: "Reason for Kicking",
          value: reason,
        }
      )
      .setFooter("hmmm...")
      .setTimestamp();
    await message.channel.send(kickConfirmEmbed);
  }
};
