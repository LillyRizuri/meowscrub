const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const warnSchema = require("../../models/warn-schema");
const settingsSchema = require("../../models/settings-schema");

const { green } = require("../../assets/json/colors.json");

module.exports = class DeleteWarnCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "delwarn",
      aliases: ["rmstrike", "pardon"],
      group: "moderation",
      memberName: "delwarn",
      description: "Delete a warn using their Warn ID.",
      argsType: "multiple",
      format: "<@user> <WarnID> [reason]",
      examples: ["delwarn @frockles _g7tfhtshw apologized"],
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
        "<:scrubnull:797476323533783050> At least provide at least one user to delete a warn for."
      );

    let target;
    let reasonForRevoking;

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

    const guildId = message.guild.id;
    const userId = target.id;

    if (!args[1])
      return message.reply(
        `<:scrubnull:797476323533783050> You need a Warn ID assigned for **${target.tag}**.`
      );

    const reasonMessage = args.slice(2).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        "<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 200 characters."
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
            await member.send(dmReasonEmbed).catch(() => {
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
        return message.channel.send(confirmationEmbed);
      }
    }

    const afterProcess = await warnSchema.findOne({
      guildId,
      userId,
    });

    if ((results.warnings = afterProcess.warnings))
      return message.reply(
        `<:scrubred:797476323169533963> The Warn ID you provided isn't a valid ID assigned for **${target.tag}**.`
      );
  }
};
