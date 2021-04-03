const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const {
  red,
  green,
  what,
  embedcolor,
} = require("../../assets/json/colors.json");

module.exports = class KickCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "kick",
      group: "moderation",
      memberName: "kick",
      description: "Kick a member. It's that easy.",
      argsType: "multiple",
      format: "<@user/userID> [reason]",
      examples: ["kick @frockles get out pls"],
      clientPermissions: ["KICK_MEMBERS"],
      userPermissions: ["KICK_MEMBERS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> Who do you want to ban? Get it right."
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
          "<:scrubred:797476323169533963> Banning yourself? Keep dreaming."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Banning myself? Why?"
        );
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 1000)
      return message.reply(
        "<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 1000 characters."
      );

    if (args[1]) {
      reason = reasonMessage;
    } else {
      reason = "No reason provided.";
    }

    const { guild } = message;

    const user = guild.members.cache.get(target.id);
    if (!user.kickable)
      return message.reply(
        "<:scrubred:797476323169533963> How in the world can I kick the user you specified, huh?"
      );

    const dmReasonEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
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
    await user.send(dmReasonEmbed).catch((err) => {
      message.channel.send(
        "Can't send the reason to the offender. Maybe they have their DM disabled."
      );
    });

    user.kick(`From ${message.author.tag}: ${reason}`);

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
      .setFooter("what now?")
      .setTimestamp();
    message.channel.send(kickConfirmEmbed);
  }
};
