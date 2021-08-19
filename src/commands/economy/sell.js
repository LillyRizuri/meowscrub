const Discord = require("discord.js");

const economySchema = require("../../models/economy-schema");

const economy = require("../../util/economy");

const emoji = require("../../assets/json/tick-emoji.json");
const { green } = require("../../assets/json/colors.json");
const shopItems = require("../../assets/js/item");

module.exports = {
  aliases: ["sell"],
  memberName: "sell",
  group: "economy",
  description:
    "Return an item to the shop for a fraction of the original price.",
  format: '<itemName> [amount/"all"]',
  examples: ["sell apple", "sell banana 3", "sell apple all"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji +
          " Please specify an item's name in order to continue."
      );

    const item = shopItems.find(
      // eslint-disable-next-line no-shadow
      (item) => item.name.toLowerCase() === args[0].toLowerCase()
    );

    if (!item)
      return message.reply(
        emoji.denyEmoji + ` There's no item called: \`${args[0]}\``
      );

    const results = await economySchema.findOne({
      userId: message.author.id,
    });

    if (!results || results.inventory.length === 0)
      return message.reply(emoji.denyEmoji + " You have no items on hand.");

    const target = results.inventory.find(
      // eslint-disable-next-line no-shadow
      (target) => target.name.toLowerCase() === item.name.toLowerCase()
    );

    if (!target)
      return message.reply(
        emoji.denyEmoji + ` You don't have any \`${item.name}\``
      );

    let amount;

    if (!args[1]) {
      amount = 1;
    } else if (args[1].toLowerCase() === "all") {
      amount = target.amount;
    } else if (args[1]) {
      amount = args[1];
    }
    amount = Number(amount);

    if (isNaN(amount) || amount <= 0)
      return message.reply(
        emoji.denyEmoji + " You are not going to break me with that."
      );

    if (!Number.isInteger(amount))
      return message.reply(emoji.denyEmoji + " Only integer allowed.");

    if (amount > target.amount)
      return message.reply(
        emoji.denyEmoji +
          ` You only have ${target.amount} of them, don't try to trick me.`
      );

    await economy.removeItem(message.author.id, item.name, amount);
    await economy.addCoins(message.author.id, item.sellPrice * amount);

    const embed = new Discord.MessageEmbed()
      .setColor(green)
      .setAuthor("Successful Sale", message.author.displayAvatarURL())
      .setDescription(
        `${
          message.author
        } sold ${amount} **${item.displayName.toProperCase()}** for \`¢${(
          item.sellPrice * amount
        ).toLocaleString()}\``
      )
      .setFooter("thank you, come again")
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
