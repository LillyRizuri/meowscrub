/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green, what } = require("../../assets/json/colors.json");

module.exports = class SetGlobalChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "setglobal",
      aliases: ["setglobalchat"],
      group: "settings",
      memberName: "setglobal",
      description: "Set a Global Chat channel.",
      details:
        "Replace the syntax with `disable` if you wish to remove the configuration.",
      argsType: "single",
      format: "<channel/channelID>",
      examples: ["setglobal #global", "setglobal 830823819505303584"],
      userPermissions: ["ADMINISTRATOR"],
      clientPermissions: ["EMBED_LINKS", "USE_EXTERNAL_EMOJIS", "MANAGE_MESSAGES"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const guildId = message.guild.id;
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args);

    switch (args) {
      default:
        if (!channel)
          return message.reply(
            "<:scrubnull:797476323533783050> No valid channel found for the configuration."
          );

        if (channel.type !== "text")
          return message.reply(
            "<:scrubred:797476323169533963> It isn't a valid text channel."
          );

        if (!channel.viewable)
          return message.reply(
            "<:scrubred:797476323169533963> I can't view your specified channel."
          );

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.globalChat": channel.id,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        // eslint-disable-next-line no-case-declarations
        const confirmationEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `<:scrubgreen:797476323316465676> **Set the Global Chat to:** ${channel}`
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
              "settings.globalChat": null,
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
            "<:scrubgreen:797476323316465676> **Removed the configuration for the Global Chat.**"
          );
        message.channel.send(confirmationRemovalEmbed);
        return;
      case "":
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results.settings.globalChat) {
          return message.reply(
            "<:scrubnull:797476323533783050> The text channel hasn't been set yet."
          );
        } else if (results.settings.globalChat) {
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(what)
            .setDescription(
              `<:scrubnull:797476323533783050> **Current Global Chat Configuration:** <#${results.settings.globalChat}>`
            );
          return message.channel.send(channelEmbed);
        }
    }
  }
};
