const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const color = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["muterole", "mutedrole"],
  memberName: "muterole",
  group: "settings",
  description: "Set a muted role for this server.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "[@role | roleName | roleID]",
  examples: ["muterole @Muted", "muterole disable"],
  clientPermissions: ["EMBED_LINKS"],
  userPermissions: ["MANAGE_GUILD"],
  singleArgs: true,
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message, args) => {
    const guildId = message.guild.id;
    const role =
      message.mentions.roles.first() ||
      message.guild.roles.cache.find(
        (e) => e.name.toLowerCase().trim() == args.toLowerCase().trim()
      ) ||
      message.guild.roles.cache.find((e) => e.id === args);

    switch (args.toLowerCase()) {
      default: {
        if (!role)
          return message.reply(
            emoji.missingEmoji + " No valid role found for the configuration."
          );

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.muteRole": role.id,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        const confirmationEmbed = new Discord.MessageEmbed()
          .setColor(color.green)
          .setDescription(
            emoji.successEmoji +
              ` **Set the Muted Role to:** ${role}\n\nRemember to deny these permissions for the role in all channels' settings:\n**Send Messages, Add Reactions, Speak, Video**.`
          )
          .setFooter(
            "we may not be held responsible for overridden roles. make sure no roles have these above permissions given entirely."
          );
        message.channel.send({ embeds: [confirmationEmbed] });
        break;
      }
      case "disable": {
        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.muteRole": null,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        const confirmationRemovalEmbed = new Discord.MessageEmbed()
          .setColor(color.green)
          .setDescription(
            emoji.successEmoji +
              " **Removed the configuration for the Muted Role.**"
          );
        message.channel.send({ embeds: [confirmationRemovalEmbed] });
        break;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.muteRole) {
          return message.reply(
            "<:scrubnull:797476323533783050> The muted role hasn't been set yet."
          );
        } else if (results && results.settings.muteRole) {
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(color.green)
            .setDescription(
              emoji.successEmoji +
                ` **Current Muted Role Configuration:** <@&${results.settings.muteRole}>`
            );
          message.channel.send({ embeds: [channelEmbed] });
        }
        break;
      }
    }
  },
};
