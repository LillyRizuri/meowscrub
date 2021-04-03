const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const { green, what, red } = require("../../assets/json/colors.json");

module.exports = class SetTicketCategoryCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "setticket",
      aliases: ["setticketcategory", "setticketparent"],
      group: "settings",
      memberName: "setticket",
      description: "Set a category for the tickets channel.",
      details:
        "Replace the syntax with `disable` if you wish to remove the configuration.",
      argsType: "single",
      format: "<categoryID>",
      examples: ["setchatbot 800959164493856858", "setchatbot disable"],
      userPermissions: ["ADMINISTRATOR"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    let guildId = message.guild.id;
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

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              ticketCategory: channel.id,
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
            `<:scrubgreen:797476323316465676> **Set the Ticket Category to:** ${channel.name} (${channel.id})\nRemember to set the category's user permissions accordingly.`
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
              ticketCategory: null,
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
        let results = await settingsSchema.find({
          guildId,
        });

        for (let i = 0; i < results.length; i++) {
          let { ticketCategory } = results[i];
          if (!ticketCategory) {
            return message.reply(
              "<:scrubnull:797476323533783050> The category ID hasn't been set yet."
            );
          } else if (ticketCategory) {
            const ticketCategoryName = message.guild.channels.cache.get(
              ticketCategory
            ).name;
            const channelEmbed = new Discord.MessageEmbed()
              .setColor(what)
              .setDescription(
                `<:scrubnull:797476323533783050> **Current Ticket Category Configuration:** ${ticketCategoryName} (${ticketCategory})`
              );
            return message.channel.send(channelEmbed);
          }
        }
    }
  }
};
