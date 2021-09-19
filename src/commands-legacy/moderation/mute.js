const Discord = require("discord.js");
const settingsSchema = require("../../models/settings-schema");
const mutedSchema = require("../../models/muted-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const { green } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["mute", "shut"],
  memberName: "mute",
  group: "moderation",
  description: "Mute a member in the current server. No timed mute yet.",
  format: "<@user | userID> [reason]",
  examples: ["mute @frockles attempting to annoy members"],
  clientPermissions: ["MANAGE_ROLES", "EMBED_LINKS"],
  userPermissions: ["MANAGE_ROLES"],
  cooldown: 3,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " There's no one for me to mute. Do something."
      );

    let reason;
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!member)
      return message.reply(emoji.denyEmoji + " What is this ID. Explain now.");

    switch (member.user) {
      case message.author:
        return message.reply(
          emoji.denyEmoji +
            " Muting yourself? Refrain yourself from doing anything then."
        );
      case client.user:
        return message.reply(emoji.denyEmoji + " Muting myself? What the...");
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        emoji.denyEmoji +
          " Consider lowering your reason's length to be just under 200 characters."
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
        emoji.denyEmoji +
          " There's no muted role set in this server.\nPlease set one using the `muterole` command."
      );

    const mutedRole = message.guild.roles.cache.find(
      (e) => e.id === guildSettings.settings.muteRole
    );

    if (!mutedRole)
      return message.reply(
        emoji.denyEmoji +
          " The muted role was set, but couldn't be found anywhere.\nMaybe the role got deleted?"
      );

    const results = await mutedSchema.findOne({
      guildId: message.guild.id,
    });

    const index = results.users.findIndex((prop) => prop === member.id);
    if (index !== -1)
      return message.reply(
        emoji.denyEmoji + ` **${member.user.tag}** is already muted.`
      );

    if (results) {
      results.users.push(member.id);
      results.save();
    } else if (!results) {
      await new mutedSchema({
        guildId: message.guild.id,
        users: member.id,
      }).save();
    }

    if (message.guild.members.resolve(member.user.id)) {
      if (
        message.member.roles.highest.position <=
          member.roles.highest.position &&
        message.guild.ownerId !== message.author.id
      )
        return message.reply(
          emoji.denyEmoji +
            ` You are not allowed to interact with **${member.user.tag}**.`
        );

      if (!member.roles.cache.has(mutedRole.id))
        await member.roles.add(
          mutedRole,
          `By ${message.author.tag}: ${reason}`
        );

      if (guildSettings && guildSettings.dmPunishment) {
        const dmReasonEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`You were muted in ${message.guild.name}.`)
          .addFields(
            {
              name: "Performed By",
              value: `${message.author.tag} (${message.author.id})`,
            },
            {
              name: "Reason for Muting",
              value: reason,
            }
          )
          .setFooter("... What were you doing?")
          .setTimestamp();
        await member.send({ embeds: [dmReasonEmbed] }).catch(() => {
          message.channel.send(
            "Can't send the reason to the offender. Maybe they have their DM disabled."
          );
        });
      }
    }

    const muteSuccessEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Successfully muted **${member.user.tag}**.\nPlease unmute by using the bot's unmute command. If you remove it manually, the role would persist if the target joins back.`
      )
      .addFields(
        {
          name: "Performed By",
          value: `${message.author.tag} (${message.author.id})`,
        },
        {
          name: "Reason for Muting",
          value: reason,
        }
      )
      .setFooter("interesting")
      .setTimestamp();
    message.channel.send({ embeds: [muteSuccessEmbed] });
  },
};
