const Commando = require("discord.js-commando");

const modules = require("../../modules");

const economy = require("../../economy");

const a = 10000,
  b = 50000,
  c = 100000,
  d = 500000,
  e = 1000000,
  f = 5000000;

module.exports = class GiveCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "give",
      aliases: ["pay"],
      group: "economy",
      memberName: "give",
      description: "Share some coins if needed. (tax included)",
      argsType: "multiple",
      argsCount: "2",
      format: "<@user> <number>",
      examples: ["give @frockles 1000"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> Please specify someone to give coins to."
      );

    let target;

    try {
      target =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]).user;
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What is that User ID."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> How can you give money to yourself?"
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> You want to give me money? I can't use them."
        );
    }

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> Neither can you check a bot's balance, or give money to them."
      );

    const coinsToGive = Number(args[1]);
    if (isNaN(coinsToGive))
      return message.reply(
        "<:scrubred:797476323169533963> Why are you giving text instead of coins?"
      );

    if (!Number.isInteger(coinsToGive))
      return message.reply(
        "<:scrubred:797476323169533963> Only integer allowed."
      );

    if (coinsToGive < 0)
      return message.reply(
        "<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value."
      );

    const coinsOwned = await economy.getCoins(message.member.id);
    if (coinsOwned < coinsToGive)
      return message.reply(
        "<:scrubred:797476323169533963> Your value exceeded your total balance."
      );

    if (coinsToGive > f)
      return message.reply(
        "<:scrubred:797476323169533963> You can't share too many coins."
      );

    let taxPercentage = Number();

    if (coinsToGive < a) taxPercentage = 0;
    else if (a < coinsToGive + 1 < b) taxPercentage = 2;
    else if (b < coinsToGive + 1 < c) taxPercentage = 5;
    else if (c < coinsToGive + 1 < d) taxPercentage = 10;
    else if (d < coinsToGive + 1 < e) taxPercentage = 20;
    else if (e < coinsToGive + 1 < f) taxPercentage = 30;

    const taxCoins = modules.round(
      coinsToGive - (coinsToGive / 100) * taxPercentage,
      0
    );

    const authorCoins = await economy.addCoins(
      message.member.id,
      coinsToGive * -1
    );

    const targetCoins = await economy.addCoins(target.id, taxCoins);

    message.reply(
      `
<:scrubgreen:797476323316465676> **${
        target.tag
      }** has received **¢${taxCoins.toLocaleString()}** after a ${taxPercentage}% tax rate.
Now you have **¢${authorCoins.toLocaleString()}** and they've **¢${targetCoins.toLocaleString()}**
`
    );
  }
};
