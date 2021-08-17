/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green, what } = require("../../assets/json/colors.json");

module.exports = class SetTicketCategoryCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "setticket",
      aliases: ["ticketcategory", "ticketparent"],
      group: "settings",
      memberName: "setticket",
      description: "Set a category for the tickets channel.",
      details:
        "Replace the syntax with `disable` if you wish to remove the configuration.",
      argsType: "single",
      format: "<categoryID>",
      examples: ["setticket 800959164493856858", "setticket disable"],
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
    const channel = message.guild.channels.cache.get(args);

    switch (args) {
      default:
        if (!channel)
          return message.reply(
            "<:scrubnull:797476323533783050> No valid category ID found for the configuration."
          );

        if (channel.type !== "category")
          return message.reply(
            "<:scrubred:797476323169533963> It isn't a valid category ID."
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
              "settings.ticketCategory": channel.id,
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
`
<:scrubgreen:797476323316465676> **Set the Ticket Category to:** \`${channel.name} - ${channel.id})\`

Remember to set the category's user permissions for staffs accordingly.
And, you may want to use the \`transcript-log\` command to log every ticket channel's all messages.
`
          );
        message.channel.send(confirmationEmbed);
        break;
      case "disable":
        const guildSettings = await settingsSchema.findOne({
          guildId,
        });

        if (guildSettings && guildSettings.settings.transcriptLog)
          return message.reply(
            "<:scrubred:797476323169533963> First, please remove the configuration for Transcript Log using the `transcript-log disable` command."
          );

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.ticketCategory": null,
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
            "<:scrubgreen:797476323316465676> **Removed the configuration for the Ticket Category.**"
          );
        message.channel.send(confirmationRemovalEmbed);
        return;
      case "":
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results.settings.ticketCategory) {
          return message.reply(
            "<:scrubnull:797476323533783050> The category ID hasn't been set yet."
          );
        } else if (results.settings.ticketCategory) {
          const ticketCategoryName = message.guild.channels.cache.get(
            results.ticketCategory
          ).name;
          const channelEmbed = new Discord.MessageEmbed()
            .setColor(what)
            .setDescription(
              `<:scrubnull:797476323533783050> **Current Ticket Category Configuration:** \`${ticketCategoryName} - ${results.settings.ticketCategory}\``
            );
          return message.channel.send(channelEmbed);
        }
    }
  }
};
