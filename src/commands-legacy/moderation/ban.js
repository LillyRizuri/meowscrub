const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const { green } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["ban"],
  memberName: "ban",
  group: "moderation",
  description: "Ban a member in the current server.",
  format: "<@user | userID> [reason]",
  examples: ["ban @frockles not complying to the rules"],
  clientPermissions: ["BAN_MEMBERS", "EMBED_LINKS"],
  userPermissions: ["BAN_MEMBERS"],
  cooldown: 3,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " Who do you want to ban? Get it right."
      );

    let reason = "";
    let target;

    try {
      target =
        message.mentions.users.first() || (await client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + " What is this ID. Explain or begone."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          emoji.denyEmoji + " Banning yourself? Keep dreaming."
        );
      case client.user:
        return message.reply(emoji.denyEmoji + " Banning myself? Why?");
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        emoji.denyEmoji +
          " Consider lowering your reason's length to be just under 200 characters."
      );

    if (args[1]) {
      reason = reasonMessage;
    } else {
      reason = "No reason provided.";
    }

    if (message.guild.members.resolve(target.id)) {
      const member = message.guild.members.cache.get(target.id);
      if (
        message.member.roles.highest.position <=
          member.roles.highest.position &&
        message.guild.ownerId !== message.author.id
      )
        return message.reply(
          emoji.denyEmoji +
            ` You are not allowed to interact with **${target.tag}**.`
        );

      if (!member.bannable)
        return message.reply(
          emoji.denyEmoji +
            " How the heck can I ban the user you specified, ya bafoon?"
        );

      const guildSettings = await settingsSchema.findOne({
        guildId: message.guild.id,
      });

      if (guildSettings && guildSettings.settings.dmPunishment) {
        const dmReasonEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(`You were banned in ${message.guild.name}.`)
          .addFields(
            {
              name: "Performed By",
              value: `${message.author.tag} (${message.author.id})`,
            },
            {
              name: "Reason for Banning",
              value: reason,
            }
          )
          .setFooter("Sorry. Can't help out.")
          .setTimestamp();
        await member.send({ embeds: [dmReasonEmbed] }).catch(() => {
          message.channel.send(
            "Can't send the reason to the offender. Maybe they have their DM disabled."
          );
        });
      }
    }

    await message.guild.members.ban(target.id, {
      days: 1,
      reason: `From ${message.author.tag}: ${reason}`,
    });

    const banConfirmEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        emoji.successEmoji + ` Successfully banned **${target.tag}**.`
      )
      .addFields(
        {
          name: "Performed By",
          value: `${message.author.tag} (${message.author.id})`,
        },
        {
          name: "Reason for Banning",
          value: reason,
        }
      )
      .setFooter("well this is e")
      .setTimestamp();
    await message.channel.send({ embeds: [banConfirmEmbed] });
  },
};
