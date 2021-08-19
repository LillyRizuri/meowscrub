const economy = require("../../util/economy");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["deposit", "dep"],
  memberName: "deposit",
  group: "economy",
  description: "Deposit your money to the bank.",
  format: '<number/"all">',
  examples: ["deposit 10000", "deposit all"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let coinsToDeposit = args;
    const userId = message.author.id;
    const coinsOwned = await economy.getCoins(userId);
    const bankCap = await economy.getBankCap(userId);
    const coinBank = await economy.getCoinBank(userId);
    if (!coinsToDeposit)
      return message.reply(
        emoji.missingEmoji + " Please input a number of coins."
      );

    if (coinBank >= bankCap) {
      return message.reply(emoji.denyEmoji + " Your bank is full.");
    }

    if (args.toLowerCase() === "all") {
      if (coinsOwned + coinBank > bankCap) {
        coinsToDeposit = bankCap - coinBank;
      } else {
        coinsToDeposit = coinsOwned;
      }
    } else {
      if (isNaN(coinsToDeposit))
        return message.reply(
          emoji.denyEmoji +
            " Depositing text is illegal, and we prohibits you from doing it."
        );

      if (!Number.isInteger(Number(coinsToDeposit)))
        return message.reply(emoji.denyEmoji + " Integer value only.");

      if (coinsToDeposit < 0)
        return message.reply(
          emoji.denyEmoji +
            " Don't even try breaking me using a simple negative value."
        );

      if (coinsOwned < coinsToDeposit)
        return message.reply(
          emoji.denyEmoji +
            ` Your argument should be no more than what you have in your pocket. **[¢${coinsOwned.toLocaleString()}]**`
        );
    }

    await economy.addCoins(userId, coinsToDeposit * -1);
    const newCoinBank = await economy.coinBank(userId, coinsToDeposit);

    message.reply(
      emoji.successEmoji +
        ` Successfully deposited your **¢${Number(
          coinsToDeposit
        ).toLocaleString()}**, current bank balance is **¢${Number(
          newCoinBank
        ).toLocaleString()}**`
    );
  },
};
