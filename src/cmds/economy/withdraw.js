const Commando = require("discord.js-commando");

const economy = require("../../economy");

module.exports = class WithdrawCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "withdraw",
      aliases: ["with"],
      group: "economy",
      memberName: "withdraw",
      description: "Take out your money from the bank.",
      argsType: "single",
      format: "<number/all>",
      examples: ["withdraw 10000", "withdraw all"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }
  async run(message, args) {
    let coinsToWithdraw = args;
    const userId = message.author.id;
    const coinsInBank = await economy.getCoinBank(userId);
    if (!coinsToWithdraw)
      return message.reply(
        "<:scrubnull:797476323533783050> Request for your money amount is needed."
      );

    if (args.toLowerCase() === "all") {
      coinsToWithdraw = coinsInBank;
    } else {
      if (isNaN(coinsToWithdraw))
        return message.reply(
          "<:scrubred:797476323169533963> Withdrawing text? We only have numbers."
        );

      if (!Number.isInteger(Number(coinsToWithdraw)))
        return message.reply(
          "<:scrubred:797476323169533963> Integer value only."
        );

      if (coinsToWithdraw < 0)
        return message.reply(
          "<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value."
        );

      if (coinsInBank < coinsToWithdraw)
        return message.reply(
          `<:scrubred:797476323169533963> Your argument should be no more than what you have in your bank. **[¢${coinsInBank.toLocaleString()}]**`
        );
    }

    const newCoinBank = await economy.coinBank(userId, coinsToWithdraw * -1);
    await economy.addCoins(userId, coinsToWithdraw);

    message.reply(
      `<:scrubgreen:797476323316465676> Successfully withdrew your **¢${Number(
        coinsToWithdraw
      ).toLocaleString()}**, current bank balance is **¢${Number(
        newCoinBank
      ).toLocaleString()}**`
    );
  }
};
