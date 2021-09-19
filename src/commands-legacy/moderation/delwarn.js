const Discord = require("discord.js");

const warnSchema = require("../../models/warn-schema");
const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const { green } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["delwarn", "pardon", "delstrike"],
  memberName: "delwarn",
  group: "moderation",
  description: "Delete a member's warning with their Warn ID.",
  details:
    "Since August 28th 2021, the unique ID is genereated using UUID; so there's no need for an user paramenter since it has a very low probability in being repeated.",
  format: "<warnID> [reason]",
  examples: ["delwarn 279a5851-71fa-4b85-9b25-6d938af16b02 apologized"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["BAN_MEMBERS"],
  cooldown: 3,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji +
          " Please provide a valid Warn ID in order to continue."
      );

    const guildId = message.guild.id;
    const result = await warnSchema.findOne({
      guildId,
      "warnings.warnId": args[0],
    });

    if (!result)
      return message.reply(
        emoji.denyEmoji +
          " The Warn ID you provided isn't a valid ID assigned for anybody."
      );

    const identifiedWarning = result.warnings.find(
      (warn) => warn.warnId === args[0]
    );

    const target = await client.users.fetch(result.userId);
    const executor = await client.users.fetch(identifiedWarning.authorId);
    const warnId = identifiedWarning.warnId;
    const reason = identifiedWarning.reason;
    let reasonForRevoking;

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

    const userId = target.id;
    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        emoji.denyEmoji +
          " Consider lowering your reason's length to be just under 200 characters."
      );

    if (args[1]) {
      reasonForRevoking = reasonMessage;
    } else {
      reasonForRevoking = "No reason provided.";
    }

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
              value: `
**ID: ${warnId}**
⠀• Was Warned By \`${executor.tag} (${executor.id})\`
⠀• Reason: \`${reason}\``,
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
        emoji.successEmoji + ` Deleted a warn with this ID:\n**\`${warnId}\` for ${target.tag}.**`
      )
      .setFooter("is this fine?")
      .setTimestamp();
    message.channel.send({ embeds: [confirmationEmbed] });
  },
};
