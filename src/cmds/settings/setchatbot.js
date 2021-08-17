/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green, what } = require("../../assets/json/colors.json");

module.exports = class SetChatbotChannelCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "setchatbot",
      aliases: ["setchatbotchannel"],
      group: "settings",
      memberName: "setchatbot",
      description: "Set a chatbot channel.",
      details:
        "Replace the syntax with `disable` if you wish to remove the configuration.",
      argsType: "single",
      format: "<channel/channelID>",
      examples: ["setchatbot #chatbot", "setchatbot disable"],
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
              "settings.chatbotChannel": channel.id,
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
            `<:scrubgreen:797476323316465676> **Set the Chatbot Channel to:** ${channel}`
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
              "settings.chatbotChannel": null,
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
            "<:scrubgreen:797476323316465676> **Removed the configuration for the Chatbot Channel.**"
          );
        message.channel.send(confirmationRemovalEmbed);
        return;
      case "":
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results.settings.chatbotChannel) {
          return message.reply(
            "<:scrubnull:797476323533783050> The text channel hasn't been set yet."
          );
        } else if (results.settings.chatbotChannel) {
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(what)
            .setDescription(
              `<:scrubnull:797476323533783050> **Current Chatbot Channel Configuration:** <#${results.settings.chatbotChannel}>`
            );
          return message.channel.send(channelEmbed);
        }
    }
  }
};
