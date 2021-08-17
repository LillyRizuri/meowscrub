/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green, what } = require("../../assets/json/colors.json");

module.exports = class SetTranscriptLogCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "transcript-log",
      aliases: ["set-transcript"],
      group: "settings",
      memberName: "transcript-log",
      description:
        "Set a channel for ticket transcript logging. Must have a ticket category channel set up.",
      details:
        "Replace the syntax with `disable` if you wish to remove the configuration.",
      argsType: "single",
      format: "<channel/channelID>",
      examples: ["transcript-log #log", "transcript-log disable"],
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

    const guildSettings = await settingsSchema.findOne({
      guildId,
    });

    if (!guildSettings || !guildSettings.settings.ticketCategory)
      return message.reply(
        "<:scrubred:797476323169533963> You must have a ticket category channel set up with the `setticket` command."
      );

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
              "settings.transcriptLog": channel.id,
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
            `<:scrubgreen:797476323316465676> **Set the Transcript Log Channel to:** ${channel}`
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
              "settings.transcriptLog": null,
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
            "<:scrubgreen:797476323316465676> **Removed the configuration for the Transcript Log Channel.**"
          );
        message.channel.send(confirmationRemovalEmbed);
        return;
      case "":
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results.settings.transcriptLog) {
          return message.reply(
            "<:scrubnull:797476323533783050> The text channel hasn't been set yet."
          );
        } else if (results.settings.transcriptLog) {
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(what)
            .setDescription(
              `<:scrubnull:797476323533783050> **Current Transcript Log Channel Configuration:** <#${results.settings.transcriptLog}>`
            );
          return message.channel.send(channelEmbed);
        }
    }
  }
};
