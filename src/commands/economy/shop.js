const Discord = require("discord.js");
const { pagination } = require("reconlx");
const { parse } = require("twemoji-parser");

const util = require("../../util/util");

const economySchema = require("../../models/economy-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const shopItems = require("../../assets/js/item");

module.exports = {
  aliases: ["shop", "items", "store"],
  memberName: "shop",
  group: "economy",
  description: "Visit the shop to see items in stock.",
  details: "Use the [itemName] parameter to check for an item's details.",
  format: "[itemName]",
  examples: ["shop", "shop apple"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
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
          emoji.denyEmoji +
            " There's no stuff for sale. Please check back later."
        );

      const splitString = util.splitString(shopList, 15);

      if (splitString.length === 1) {
        const embed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle("Items on Stock")
          .setDescription(shopList)
          .setFooter(
            `See more info on an item by using ${await util.getPrefix(
              message.guild.id
            )}shop [itemName]`
          )
          .setTimestamp();

        message.channel.send({ embeds: [embed] });
      } else if (splitString.length > 1) {
        const embeds = [];
        for (let i = 0; i < splitString.length; i++) {
          const embed = new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setTitle("Items on Stock")
            .setDescription(splitString[i])
            .setFooter(
              `See more info on an item by using ${await util.getPrefix(
                message.guild.id
              )}shop [itemName]`
            )
            .setTimestamp();
          embeds.push(embed);
        }

        pagination({
          embeds: embeds,
          author: message.author,
          channel: message.channel,
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
      }
    } else if (args) {
      const item = shopItems.find(
        // eslint-disable-next-line no-shadow
        (item) => item.name.toLowerCase() === args.toLowerCase()
      );

      if (!item)
        return message.reply(
          emoji.denyEmoji + ` There's no item called: \`${args}\``
        );

      let itemEmoji = "";

      const parsedEmoji = Discord.Util.parseEmoji(item.emoji);
      if (parsedEmoji.id) {
        const extension = parsedEmoji.animated ? ".gif" : ".png";
        itemEmoji = `https://cdn.discordapp.com/emojis/${
          parsedEmoji.id + extension
        }`;
      } else {
        const parsed = parse(item.emoji, { assetType: "png" });
        itemEmoji = parsed[0].url;
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
        .setThumbnail(itemEmoji)
        .setDescription(
          `${
            item.description
          }\n• Buy: \`¢${itemPrice}\`\n• Sell: \`¢${item.sellPrice.toLocaleString()}\``
        )
        .setTimestamp();

      message.channel.send(embed);
    }
  },
};
