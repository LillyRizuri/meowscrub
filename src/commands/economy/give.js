const modules = require("../../util/modules");
const economy = require("../../util/economy");

const emoji = require("../../assets/json/tick-emoji.json");

const a = 10000,
  b = 50000,
  c = 100000,
  d = 500000,
  e = 1000000,
  f = 5000000;

module.exports = {
  aliases: ["give", "pay"],
  memberName: "give",
  group: "economy",
  description: "Share some coins to another user",
  format: "<@user | userID> <number>",
  examples: ["give @frockles 1000"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " Please specify someone to give coins to."
      );

    let target;

    try {
      target =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]).user;
    } catch (err) {
      return message.reply(emoji.denyEmoji + " What is that User ID.");
    }

    switch (target) {
      case message.author:
        return message.reply(
          emoji.denyEmoji + " How can you give money to yourself?"
        );
      case client.user:
        return message.reply(
          emoji.denyEmoji + " You want to give me money? I can't use them."
        );
    }

    if (target.bot === true)
      return message.reply(
        emoji.denyEmoji +
          " Neither can you check a bot's balance, or give money to them."
      );

    const coinsToGive = Number(args[1]);
    if (!args[1])
      return message.reply(
        emoji.missingEmoji + " You're going to give them nothing? Really?"
      );

    if (isNaN(coinsToGive))
      return message.reply(
        emoji.denyEmoji + " Why are you giving text instead of coins?"
      );

    if (!Number.isInteger(coinsToGive))
      return message.reply(emoji.denyEmoji + " Only integer allowed.");

    if (coinsToGive < 0)
      return message.reply(
        emoji.denyEmoji +
          " Don't even try breaking me using a simple negative value."
      );

    const coinsOwned = await economy.getCoins(message.member.id);
    if (coinsOwned < coinsToGive)
      return message.reply(
        emoji.denyEmoji + " Your value exceeded your total balance."
      );

    if (coinsToGive > f)
      return message.reply(
        emoji.denyEmoji + " You can't share too many coins."
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
      emoji.successEmoji +
        ` **${
          target.tag
        }** has received **¢${taxCoins.toLocaleString()}** after a ${taxPercentage}% tax rate.
Now you have **¢${authorCoins.toLocaleString()}** and they've **¢${targetCoins.toLocaleString()}**
`
    );
  },
};
