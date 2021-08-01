const Commando = require("discord.js-commando");

const economy = require("../../economy");

module.exports = class DepositCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "deposit",
      aliases: ["dep"],
      group: "economy",
      memberName: "deposit",
      description: "Deposit your money to the bank.",
      argsType: "single",
      format: "<number/all>",
      examples: ["deposit 10000", "deposit all"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }
  async run(message, args) {
    let coinsToDeposit = args;
    const userId = message.author.id;
    const coinsOwned = await economy.getCoins(userId);
    const bankCap = await economy.getBankCap(userId);
    const coinBank = await economy.getCoinBank(userId);
    if (!coinsToDeposit)
      return message.reply(
        "<:scrubnull:797476323533783050> Please input a number of coins."
      );

    if (coinBank >= bankCap) {
      return message.reply("<:scrubred:797476323169533963> Your bank is full.");
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
          "<:scrubred:797476323169533963> Depositing text is illegal, and we prohibits you from doing it."
        );

      if (!Number.isInteger(Number(coinsToDeposit)))
        return message.reply(
          "<:scrubred:797476323169533963> Integer value only."
        );

      if (coinsToDeposit < 0)
        return message.reply(
          "<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value."
        );

      if (coinsOwned < coinsToDeposit)
        return message.reply(
          `<:scrubred:797476323169533963> Your argument should be no more than what you have in your pocket. **[¢${coinsOwned.toLocaleString()}]**`
        );
    }

    await economy.addCoins(userId, coinsToDeposit * -1);
    const newCoinBank = await economy.coinBank(userId, coinsToDeposit);

    message.reply(
      `<:scrubgreen:797476323316465676> Successfully deposited your **¢${Number(
        coinsToDeposit
      ).toLocaleString()}**, current bank balance is **¢${Number(
        newCoinBank
      ).toLocaleString()}**`
    );
  }
};
