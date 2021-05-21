const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const economy = require("../../economy");

const { green } = require("../../assets/json/colors.json");

module.exports = class WithdrawCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "withdraw",
      aliases: ["with"],
      group: "economy",
      memberName: "withdraw",
      description: "With your money from the bank. to your pocket",
      argsType: "single",
      format: "<number/all>",
      examples: ["withdraw 10000", "withdraw all"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }
  async run(message, args) {
    let coinsToWithdraw = args;
    const guildId = message.guild.id;
    const userId = message.author.id;
    const coinsInBank = await economy.getCoinBank(guildId, userId);
    if (!coinsToWithdraw)
      return message.reply(
        "<:scrubnull:797476323533783050> Request for your money amount is needed."
      );

    if (coinsToWithdraw === "all") coinsToWithdraw = coinsInBank;
    if (isNaN(coinsToWithdraw))
      return message.reply(
        "<:scrubred:797476323169533963> Withdrawing text? We only have numbers."
      );

    if (coinsToWithdraw < 0)
      return message.reply(
        "<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value."
      );

    if (coinsInBank < coinsToWithdraw)
      return message.reply(
        `<:scrubred:797476323169533963> Your argument should be no more than what you have in your bank. **[¢${coinsInBank}]**`
      );

    const currentBankAcc = await economy.coinBank(
      guildId,
      userId,
      coinsToWithdraw * -1
    );

    const remainingCoins = await economy.addCoins(
      guildId,
      userId,
      coinsToWithdraw
    );

    const addbalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `
<:scrubgreen:797476323316465676> Successfully withdrew your **¢${coinsToWithdraw}**.
**Your Wallet: ¢${remainingCoins}**
**Your Bank Account: ¢${currentBankAcc}**`
      )
      .setFooter("hmmmmmm")
      .setTimestamp();
    message.reply(addbalEmbed);
  }
};
