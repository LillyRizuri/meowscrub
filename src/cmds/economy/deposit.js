const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const economy = require("../../economy");

const { green } = require("../../assets/json/colors.json");

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
      guildOnly: true,
    });
  }
  async run(message, args) {
    let coinsToDeposit = args;
    const guildId = message.guild.id;
    const userId = message.author.id;
    const coinsOwned = await economy.getCoins(guildId, userId);
    if (!coinsToDeposit)
      return message.reply(
        "<:scrubnull:797476323533783050> Request for your money amount is needed."
      );

    if (coinsToDeposit === "all") coinsToDeposit = coinsOwned;
    if (isNaN(coinsToDeposit))
      return message.reply(
        "<:scrubred:797476323169533963> Depositing text is illegal, and we prohibited you from doing it."
      );

    if (coinsToDeposit < 0)
      return message.reply(
        "<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value."
      );

    if (coinsOwned < coinsToDeposit)
      return message.reply(
        `<:scrubred:797476323169533963> Your argument should be no more than what you have in your pocket. **[¢${coinsOwned}]**`
      );

    const remainingCoins = await economy.addCoins(
      guildId,
      userId,
      coinsToDeposit * -1
    );
    const currentBankAcc = await economy.coinBank(
      guildId,
      userId,
      coinsToDeposit
    );

    const addbalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `
<:scrubgreen:797476323316465676> Successfully deposited your **¢${coinsToDeposit}**.
**Your Wallet: ¢${remainingCoins}**
**Your Bank Account: ¢${currentBankAcc}**`
      )
      .setFooter("hmmmmmm")
      .setTimestamp();
    message.reply(addbalEmbed);
  }
};
