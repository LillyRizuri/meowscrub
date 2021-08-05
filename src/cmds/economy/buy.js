const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const economy = require("../../economy");

const { green } = require("../../assets/json/colors.json");
const shopItems = require("../../assets/js/item");

module.exports = class BuyCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "buy",
      aliases: ["purchase"],
      group: "economy",
      memberName: "buy",
      description: "Buy stuff from the shop.",
      argsType: "multiple",
      format: "<itemName> [amount]",
      examples: ["buy apple", "buy banana 3"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> Please specify an item's name in order to continue."
      );

    const item = shopItems.find(
      // eslint-disable-next-line no-shadow
      (item) => item.name.toLowerCase() === args[0].toLowerCase()
    );

    if (!item)
      return message.reply(
        `<:scrubred:797476323169533963> There's no item called: \`${args[0]}\``
      );

    if (!item.available)
      return message.reply(
        "<:scrubred:797476323169533963> The item is not available for sale. Please check back later."
      );

    let amount;

    if (args[1]) amount = args[1];
    else amount = 1;

    amount = Number(amount);

    if (isNaN(amount) || amount <= 0)
      return message.reply(
        "<:scrubred:797476323169533963> You are not going to break me with that."
      );

    if (!Number.isInteger(amount))
      return message.reply(
        "<:scrubred:797476323169533963> Only integer allowed."
      );

    const currentBalance = await economy.getCoins(message.author.id);

    if (currentBalance < item.price * amount)
      return message.reply(
        "<:scrubred:797476323169533963> You don't have a sufficient balance for that item."
      );

    await economy.addItem(message.author.id, item.name, amount);
    await economy.addCoins(message.author.id, item.price * amount * -1);

    const embed = new Discord.MessageEmbed()
      .setColor(green)
      .setAuthor("Successful Purchase", message.author.displayAvatarURL())
      .setDescription(
        `${
          message.author
        } bought ${amount} **${item.displayName.toProperCase()}** and paid **¢${(
          item.price * amount
        ).toLocaleString()}**`
      )
      .setFooter("thank you, come again")
      .setTimestamp();

    message.channel.send(embed);
  }
};
