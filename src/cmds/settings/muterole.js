/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green, what } = require("../../assets/json/colors.json");

module.exports = class SetMuteRoleCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "muterole",
      aliases: ["mutedrole", "setmutedrole", "setmuterole"],
      group: "settings",
      memberName: "muterole",
      description: "Set a muted role.",
      details:
        "Replace the syntax with `disable` if you wish to remove the configuration.",
      argsType: "single",
      format: "<@role/roleID>",
      examples: ["muterole @Muted", "muterole disable"],
      userPermissions: ["ADMINISTRATOR"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const guildId = message.guild.id;
    const role =
      message.mentions.roles.first() ||
      message.guild.roles.cache.find((e) => e.id === args);

    switch (args) {
      default:
        if (!role)
          return message.reply(
            "<:scrubnull:797476323533783050> No valid role found for the configuration."
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
          .setColor(green)
          .setDescription(
            `<:scrubgreen:797476323316465676> **Set the Muted Role to:** ${role}\n\nRemember to deny these permissions for the role in all channels' settings.:\n**Send Messages, Add Reactions, Speak, Video**.`
          )
          .setFooter(
            "we may not be held responsible for overridden roles. make sure no roles have these above permissions given entirely."
          );
        message.channel.send(confirmationEmbed);
        break;
      case "disable":
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
          .setColor(green)
          .setDescription(
            "<:scrubgreen:797476323316465676> **Removed the configuration for the Muted Role.**"
          );
        message.channel.send(confirmationRemovalEmbed);
        return;
      case "":
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results.settings.muteRole) {
          return message.reply(
            "<:scrubnull:797476323533783050> The muted role hasn't been set yet."
          );
        } else if (results.settings.muteRole) {
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(what)
            .setDescription(
              `<:scrubnull:797476323533783050> **Current Muted Role Configuration:** <@&${results.settings.muteRole}>`
            );
          return message.channel.send(channelEmbed);
        }
    }
  }
};
