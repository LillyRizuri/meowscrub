const Discord = require("discord.js");

const warnSchema = require("../../models/warn-schema");
const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const { green } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["delwarn", "pardon", "delstrike"],
  memberName: "delwarn",
  group: "moderation",
  description: "Delete an user's warn using their Warn ID.",
  format: "<@user/userID> <warnID> [reason]",
  examples: ["delwarn @frockles _g7tfhtshw apologized"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["BAN_MEMBERS"],
  cooldown: 5,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji +
          " At least provide at least one user to delete a warn for."
      );

    let target;
    let reasonForRevoking;

    try {
      target =
        message.mentions.users.first() ||
        (await client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(emoji.denyEmoji + " THAT'S not a valid user.");
    }
    const member = message.guild.members.cache.get(target.id);

    if (message.guild.members.resolve(target.id)) {
      if (
        message.member.roles.highest.position <=
          member.roles.highest.position &&
        message.guild.ownerId !== message.author.id
      )
        return message.reply(
          emoji.denyEmoji +
            ` You are not allowed to interact with **${target.tag}**.`
        );
    }

    const guildId = message.guild.id;
    const userId = target.id;

    if (!args[1])
      return message.reply(
        emoji.missingEmoji +
          ` You need a Warn ID assigned for **${target.tag}**.`
      );

    const reasonMessage = args.slice(2).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        emoji.denyEmoji +
          " Consider lowering your reason's length to be just under 200 characters."
      );

    if (args[2]) {
      reasonForRevoking = reasonMessage;
    } else {
      reasonForRevoking = "No reason provided.";
    }

    const results = await warnSchema.findOne({
      guildId,
      userId,
    });

    for (let i = 0; i < results.warnings.length; i++) {
      const { author, authorId, warnId, reason } = results.warnings[i];
      if (args[1] === warnId) {
        if (message.guild.members.resolve(target.id)) {
          const guildSettings = await settingsSchema.findOne({
            guildId,
          });

          if (guildSettings && guildSettings.settings.dmPunishment) {
            const dmReasonEmbed = new Discord.MessageEmbed()
              .setColor("RANDOM")
              .setTitle(`Your warn got deleted in ${message.guild.name}.`)
              .addFields(
                {
                  name: "Performed By",
                  value: `${message.author.tag} (${message.author.id})`,
                },
                {
                  name: "Content of The Deleted Warn",
                  value: `ID: \`${warnId} - ${reason}\`\nExecutor: \`${author} (${authorId})\``,
                },
                {
                  name: "Reason for Deleting",
                  value: reasonForRevoking,
                }
              )
              .setFooter("Hmmm...")
              .setTimestamp();
            await member.send({ embeds: [dmReasonEmbed] }).catch(() => {
              message.channel.send(
                "Can't send the reason to the target. Maybe they have their DM disabled."
              );
            });
          }
        }

        await warnSchema.findOneAndUpdate(
          {
            guildId,
            userId,
          },
          {
            guildId,
            userId,
            $pull: {
              warnings: {
                warnId,
              },
            },
          }
        );

        const confirmationEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `<:scrubgreen:797476323316465676> Deleted a warn with this ID:\n**\`${warnId}\` for ${target.tag}.**`
          )
          .setFooter("is this fine?")
          .setTimestamp();
        return message.channel.send({ embeds: [confirmationEmbed] });
      }
    }

    const afterProcess = await warnSchema.findOne({
      guildId,
      userId,
    });

    if ((results.warnings = afterProcess.warnings))
      return message.reply(
        emoji.denyEmoji +
          ` The Warn ID you provided isn't a valid ID assigned for **${target.tag}**.`
      );
  },
};
