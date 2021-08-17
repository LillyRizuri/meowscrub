const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");
const settingsSchema = require("../../models/settings-schema");
const mutedSchema = require("../../models/muted-schema");

module.exports = class MuteCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "unmute",
      group: "moderation",
      memberName: "unmute",
      description: "Remove someone's mute entirely from the server.",
      argsType: "multiple",
      format: "<@user/userID> [reason]",
      examples: ["unmute @frockles forgiven"],
      clientPermissions: ["MANAGE_ROLES", "EMBED_LINKS"],
      userPermissions: ["MANAGE_ROLES"],
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
        "<:scrubnull:797476323533783050> There's no one for me to revoke their mute. Do something."
      );

    let reason;
    let member;

    try {
      member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What is this ID. Explain or you *gon*."
      );
    }

    switch (member.user) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Unmuting yourself? You can already speak."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Unmuting myself? Pointless."
        );
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        "<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 200 characters."
      );

    if (reasonMessage) {
      reason = reasonMessage;
    } else {
      reason = "No reason provided.";
    }

    const guildSettings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (!guildSettings || !guildSettings.settings.muteRole)
      return message.reply(
        "<:scrubred:797476323169533963> There's no muted role set in this server.\nPlease set one using the `muterole` command."
      );

    const mutedRole = message.guild.roles.cache.find(
      (e) => e.id === guildSettings.settings.muteRole
    );

    if (!mutedRole)
      return message.reply(
        "<:scrubred:797476323169533963> The muted role was set, but couldn't be found anywhere.\nMaybe the role got deleted?"
      );

    const results = await mutedSchema.findOne({
      guildId: message.guild.id,
    });

    if (message.guild.members.resolve(member.user.id)) {
      if (
        message.member.roles.highest.position <=
          member.roles.highest.position &&
        message.guild.ownerID !== message.author.id
      )
        return message.reply(
          `<:scrubred:797476323169533963> You are not allowed to interact with **${member.user.tag}**.`
        );
    }

    if (!results)
      return message.reply(
        `<:scrubred:797476323169533963> **${member.user.tag}** hasn't been muted yet.`
      );

    const user = results.users.findIndex((prop) => prop === member.id);
    if (user === -1)
      return message.reply(
        `<:scrubred:797476323169533963> **${member.user.tag}** hasn't been muted yet.`
      );

    await mutedSchema.findOneAndUpdate(
      {
        guildId: message.guild.id,
      },
      {
        guildId: message.guild.id,
        $pull: {
          users: member.id,
        },
      }
    );

    if (message.guild.members.resolve(member.user.id)) {
      await member.roles.remove(
        mutedRole,
        `From ${message.author.tag}: ${reason}`
      );

      if (guildSettings && guildSettings.settings.dmPunishment) {
        const dmReasonEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`You were unmuted in ${message.guild.name}.`)
          .addFields(
            {
              name: "Performed By",
              value: `${message.author.tag} (${message.author.id})`,
            },
            {
              name: "Reason for Unmuting",
              value: reason,
            }
          )
          .setFooter("... What were you doing again?")
          .setTimestamp();
        await member.send(dmReasonEmbed).catch(() => {
          message.channel.send(
            "Can't send the reason to the target. Maybe they have their DM disabled."
          );
        });
      }
    }

    const muteSuccessEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Successfully unmuted **${member.user.tag}**.`
      )
      .addFields(
        {
          name: "Performed By",
          value: `${message.author.tag} (${message.author.id})`,
        },
        {
          name: "Reason for Unmuting",
          value: reason,
        }
      )
      .setFooter("hmmmm")
      .setTimestamp();
    message.channel.send(muteSuccessEmbed);
  }
};
