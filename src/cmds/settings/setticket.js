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
        if (!channel) {
          const noValidCategoryEmbed = new Discord.MessageEmbed()
            .setColor(what)
            .setDescription(
              "<:scrubnull:797476323533783050> No valid category found for the configuration."
            )
            .setFooter("can you try again once more?")
            .setTimestamp();
          return message.reply(noValidCategoryEmbed);
        }

        if (channel.type !== "category") {
          const notCategoryEmbed = new Discord.MessageEmbed()
            .setColor(red)
            .setDescription(
              "<:scrubred:797476323169533963> It isn't a valid category ID."
            )
            .setFooter("what is that supposed to mean")
            .setTimestamp();
          return message.reply(notCategoryEmbed);
        }

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
            const noSetEmbed = new Discord.MessageEmbed()
              .setColor(what)
              .setDescription(
                "<:scrubnull:797476323533783050> The category hasn't been set yet."
              )
              .setFooter("set one with id")
              .setTimestamp();
            return message.reply(noSetEmbed);
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
