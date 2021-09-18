const economy = require("../../util/economy");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["withdraw", "with"],
  memberName: "withdraw",
  group: "economy",
  description: "Take out your money from the bank.",
  format: '<number | "all">',
  examples: ["withdraw 10000", "withdraw all"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let coinsToWithdraw = args;
    const userId = message.author.id;
    const coinsInBank = await economy.getCoinBank(userId);
    if (!coinsToWithdraw)
      return message.reply(
        emoji.missingEmoji + " Request for your money amount is needed."
      );

    if (args.toLowerCase() === "all") {
      coinsToWithdraw = coinsInBank;
    } else {
      if (isNaN(coinsToWithdraw))
        return message.reply(
          emoji.denyEmoji + " Withdrawing text? We only have numbers."
        );

      if (!Number.isInteger(Number(coinsToWithdraw)))
        return message.reply(emoji.denyEmoji + " Integer value only.");

      if (coinsToWithdraw < 0)
        return message.reply(
          emoji.denyEmoji +
            " Don't even try breaking me using a simple negative value."
        );

      if (coinsInBank < coinsToWithdraw)
        return message.reply(
          emoji.denyEmoji +
            ` Your argument should be no more than what you have in your bank. **[¢${coinsInBank.toLocaleString()}]**`
        );
    }

    const newCoinBank = await economy.coinBank(userId, coinsToWithdraw * -1);
    await economy.addCoins(userId, coinsToWithdraw);

    message.reply(
      emoji.successEmoji +
        ` Successfully withdrew your **¢${Number(
          coinsToWithdraw
        ).toLocaleString()}**, current bank balance is **¢${Number(
          newCoinBank
        ).toLocaleString()}**`
    );
  },
};
