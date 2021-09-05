const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const uuid = require("uuid");
const { pagination } = require("reconlx");

const warnSchema = require("../../models/warn-schema");
const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const { green } = require("../../assets/json/colors.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Manage warnings for an user in the server.")
    .addSubcommand((command) =>
      command
        .setName("add")
        .setDescription("Issue a warn for an user in the server.")
        .addUserOption((option) =>
          option.setName("user").setDescription("An user").setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason of warning the target user")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("list")
        .setDescription(
          "Displays all warnings from a specified user in the current server."
        )
        .addUserOption((option) =>
          option.setName("user").setDescription("An user").setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("delete")
        .setDescription("Delete a member's warning with their Warn ID.")
        .addStringOption((option) =>
          option
            .setName("warn-id")
            .setDescription("The Warn ID assigned for an user")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Reason of deleting the warn")
        )
    ),
  group: "moderation",
  details:
    "Since August 28th 2021, the unique ID is genereated using UUID version 4; so the generated ID has a very low probability in being repeated.",
  examples: ["warn add @frockles spamming", "warn list @frockles", "warn delete 279a5851-71fa-4b85-9b25-6d938af16b02 apologized"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["BAN_MEMBERS"],
  guildOnly: true,
  callback: async (client, interaction) => {
    switch (interaction.options.getSubcommand()) {
      case "add": {
        const target = interaction.options.getUser("user");
        const member = interaction.guild.members.cache.get(target.id);

        if (interaction.guild.members.resolve(target.id)) {
          if (
            interaction.member.roles.highest.position <=
              member.roles.highest.position &&
            interaction.guild.ownerId !== interaction.user.id
          )
            return interaction.reply({
              content:
                emoji.denyEmoji +
                ` You are not allowed to interact with **${target.tag}**.`,
              ephemeral: true,
            });
        }

        switch (target) {
          case interaction.user:
            return interaction.reply({
              content:
                emoji.denyEmoji +
                " I won't allow you to warn yourself. That's stupid.",
              ephemeral: true,
            });
          case client.user:
            return interaction.reply({
              content:
                emoji.denyEmoji + " Explain why do I need to warn myself.",
              ephemeral: true,
            });
        }

        if (target.bot)
          return interaction.reply({
            content:
              emoji.denyEmoji + " Warning a bot user is useless, y'know.",
            ephemeral: true,
          });

        const warnId = uuid.v4();
        const guildId = interaction.guild.id;
        const userId = target.id;
        const reason = interaction.options.getString("reason");

        if (reason.length > 200)
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " The reason for warning musn't be more than 200 characters.",
            ephemeral: true,
          });

        interaction.reply("Attempting to warn the user...");

        const warning = {
          authorId: interaction.user.id,
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

        if (interaction.guild.members.resolve(target.id)) {
          const guildSettings = await settingsSchema.findOne({
            guildId,
          });

          if (guildSettings && guildSettings.settings.dmPunishment) {
            const dmReasonEmbed = new Discord.MessageEmbed()
              .setColor("RANDOM")
              .setTitle(`You got warned in ${interaction.guild.name}.`)
              .addFields(
                {
                  name: "Performed By",
                  value: `${interaction.user.tag} (${interaction.user.id})`,
                },
                {
                  name: "Reason for Warning",
                  value: `**ID: ${warnId}**\n⠀• Reason: \`${reason}\``,
                }
              )
              .setFooter("Hmmm...")
              .setTimestamp();
            await member.send({ embeds: [dmReasonEmbed] }).catch(() => {
              interaction.channel.send(
                "Can't send the reason to the target. Maybe they have their DM disabled."
              );
            });
          }
        }

        const warnedEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            emoji.successEmoji +
              ` **${target.tag}** has been warned for this following reason:\n\`${reason}\``
          )
          .setFooter(`WarnID: ${warnId}`)
          .setTimestamp();
        interaction.channel.send({ embeds: [warnedEmbed] });
        break;
      }
      case "list": {
        const dateTimeOptions = {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        };

        const target = interaction.options.getUser("user");

        const guildId = interaction.guild.id;
        const userTag = target.tag;
        const userAvatar = target.displayAvatarURL({ dynamic: true });
        const userId = target.id;

        const results = await warnSchema.findOne({
          guildId,
          userId,
        });

        let output = "";

        try {
          results.warnings = results.warnings.sort(
            (a, b) => b.timestamp - a.timestamp
          );

          for (const warning of results.warnings) {
            const { authorId, timestamp, warnId, reason } = warning;

            const formattedTimestamp = new Date(timestamp).toLocaleDateString(
              "en-US",
              dateTimeOptions
            );

            const author = await client.users.fetch(authorId);

            // output += `\`${warnId}: ${formattedTimestamp}\` - By **${author.tag}** (${authorId})\n**Reason:** ${reason}\n\n`;
            output += `**${warnId}**\n⠀• Date: \`${formattedTimestamp}\`\n⠀• By: \`${author.tag} (${authorId})\`\n⠀• Reason: \`${reason}\`\n\n`;
          }
        } catch (err) {
          return interaction.reply({
            content: emoji.denyEmoji + " There's no warnings for that user.",
            ephemeral: true,
          });
        }

        if (!output)
          return interaction.reply({
            content: emoji.denyEmoji + " There's no warnings for that user.",
            ephemeral: true,
          });

        interaction.reply("Listing warnings for the specified user...");

        const splitOutput = Discord.Util.splitMessage(output, {
          maxLength: 1024,
          char: "\n\n",
          prepend: "",
          append: "",
        });

        const embeds = [];

        for (let i = 0; i < splitOutput.length; i++) {
          const embed = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setAuthor(
              `Previous warnings for ${userTag} (${userId})`,
              userAvatar
            )
            .setDescription(splitOutput[i])
            .setFooter(`${results.warnings.length} warn(s) in total`)
            .setTimestamp();
          embeds.push(embed);
        }

        pagination({
          embeds: embeds,
          author: interaction.user,
          channel: interaction.channel,
          fastSkip: true,
          time: 60000,
          button: [
            {
              name: "first",
              emoji: emoji.firstEmoji,
              style: "PRIMARY",
            },
            {
              name: "previous",
              emoji: emoji.leftEmoji,
              style: "PRIMARY",
            },
            {
              name: "next",
              emoji: emoji.rightEmoji,
              style: "PRIMARY",
            },
            {
              name: "last",
              emoji: emoji.lastEmoji,
              style: "PRIMARY",
            },
          ],
        });
        break;
      }
      case "delete": {
        const initialWarnId = interaction.options.getString("warn-id");

        const guildId = interaction.guild.id;
        const result = await warnSchema.findOne({
          guildId,
          "warnings.warnId": initialWarnId,
        });

        if (!result)
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " The Warn ID you provided isn't a valid ID assigned for anybody.",
            ephemeral: true,
          });

        const identifiedWarning = result.warnings.find(
          (warn) => warn.warnId === initialWarnId
        );

        const target = await client.users.fetch(result.userId);
        const executor = await client.users.fetch(identifiedWarning.authorId);
        const warnId = identifiedWarning.warnId;
        const reason = identifiedWarning.reason;
        let reasonForRevoking;

        const member = interaction.guild.members.cache.get(target.id);

        if (interaction.guild.members.resolve(target.id)) {
          if (
            interaction.member.roles.highest.position <=
              member.roles.highest.position &&
            interaction.guild.ownerId !== interaction.user.id
          )
            return interaction.reply({
              content:
                emoji.denyEmoji +
                ` You are not allowed to interact with **${target.tag}**.`,
              ephemeral: true,
            });
        }

        const userId = target.id;
        const reasonMessage = interaction.options.getString("reason");

        if (reasonMessage.length > 200)
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " Consider lowering your reason's length to be just under 200 characters.",
            ephemeral: true,
          });

        if (reasonMessage) {
          reasonForRevoking = reasonMessage;
        } else {
          reasonForRevoking = "No reason provided.";
        }

        interaction.reply("Attempting to delete the warn...");

        if (interaction.guild.members.resolve(target.id)) {
          const guildSettings = await settingsSchema.findOne({
            guildId,
          });

          if (guildSettings && guildSettings.settings.dmPunishment) {
            const dmReasonEmbed = new Discord.MessageEmbed()
              .setColor("RANDOM")
              .setTitle(`Your warn got deleted in ${interaction.guild.name}.`)
              .addFields(
                {
                  name: "Performed By",
                  value: `${interaction.user.tag} (${interaction.user.id})`,
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
              interaction.channel.send(
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
            emoji.successEmoji +
              ` Deleted a warn with this ID:\n**\`${warnId}\` for ${target.tag}.**`
          )
          .setFooter("is this fine?")
          .setTimestamp();
        interaction.channel.send({ embeds: [confirmationEmbed] });
        break;
      }
    }
  },
};
