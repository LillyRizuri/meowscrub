const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { PaginatedEmbed } = require("embed-paginator");
const { parse } = require("twemoji-parser");

const modules = require("../../modules");

const economySchema = require("../../models/economy-schema");

const shopItems = require("../../assets/js/item");

module.exports = class ShopCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "shop",
      aliases: ["items", "store"],
      group: "economy",
      memberName: "shop",
      description: "Visit the shop to see items in stock.",
      details: "Use the [itemName] parameter to check for an item's info.",
      argsType: "single",
      format: "[itemName]",
      examples: ["shop", "shop apple"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args) {
      const shopList = shopItems
        .filter((item) => item.available)
        .map(
          (item) =>
            `${item.emoji} **${item.displayName.toProperCase()} \`${
              item.name
            }\`** ─ [¢${item.price.toLocaleString()}](https://youtu.be/S0qC_J1VaZI)\n${
              item.description
            }`
        )
        .join("\n\n");

      if (shopList === 0)
        return message.reply(
          "<:scrubred:797476323169533963> There's no stuff for sale. Please check back later."
        );

      const splitString = modules.splitString(shopList, 15);

      if (splitString.length === 1) {
        const embed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor(
            `see more info on an item by using ${message.guild.commandPrefix}shop [item]`
          )
          .setTitle("Items on Stock")
          .setDescription(shopList)
          .setTimestamp();

        message.channel.send(embed);
      } else if (splitString.length > 1) {
        const embed = new PaginatedEmbed({
          colours: ["RANDOM"],
          descriptions: splitString,
          duration: 60 * 1000,
          paginationType: "description",
          itemsPerPage: 1,
        })
          .setAuthor(
            `see more info on an item by using ${message.guild.commandPrefix}shop [item]`
          )
          .setTitle("Items on Stock")
          .setTimestamp();

        embed.send(message.channel);
      }
    } else if (args) {
      const item = shopItems.find(
        // eslint-disable-next-line no-shadow
        (item) => item.name.toLowerCase() === args.toLowerCase()
      );

      if (!item)
        return message.reply(
          `<:scrubred:797476323169533963> There's no item called: \`${args}\``
        );

      let emoji = "";

      const parsedEmoji = Discord.Util.parseEmoji(item.emoji);
      if (parsedEmoji.id) {
        const extension = parsedEmoji.animated ? ".gif" : ".png";
        emoji = `https://cdn.discordapp.com/emojis/${
          parsedEmoji.id + extension
        }`;
      } else {
        const parsed = parse(item.emoji, { assetType: "png" });
        emoji = parsed[0].url;
      }

      let owned = "";

      const results = await economySchema.findOne({
        userId: message.author.id,
      });

      if (!results) {
        owned = "";
      } else if (results) {
        const target = results.inventory.find(
          // eslint-disable-next-line no-shadow
          (target) => target.name.toLowerCase() === item.name.toLowerCase()
        );
        if (!target) {
          owned = "";
        } else if (target) {
          owned = `| ${target.amount} owned`;
        }
      }

      let itemPrice;

      if (item.price) itemPrice = item.price.toLocaleString();
      else if (!item.price) itemPrice = "Not available to purchase";

      const embed = new Discord.MessageEmbed()
        .setTitle(`${item.name.toProperCase()} ${owned}`)
        .setColor("RANDOM")
        .setThumbnail(emoji)
        .setDescription(
          `${
            item.description
          }\n• Buy: \`¢${itemPrice}\`\n• Sell: \`¢${item.sellPrice.toLocaleString()}\``
        )
        .setTimestamp();

      message.channel.send(embed);
    }
  }
};
