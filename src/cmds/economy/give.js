const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const economy = require("../../economy");

const { green } = require("../../assets/json/colors.json");

module.exports = class GiveCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "give",
      aliases: ["pay"],
      group: "economy",
      memberName: "give",
      description: "Feel free to share some coins if needed.",
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
        message.guild.members.cache.get(args).user;
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
          "<:scrubred:797476323169533963> You wanted to gave me your money so hard, but I can't use them."
        );
    }

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> Neither can you check a bot's balance, or give money to them."
      );

    const coinsToGive = args[1];
    if (isNaN(coinsToGive))
      return message.reply(
        "<:scrubred:797476323169533963> Why are you giving text instead of coins?"
      );

    if (coinsToGive < 0)
      return message.reply(
        "<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value."
      );

    const coinsOwned = await economy.getCoins(message.guild.id, message.member.id);
    if (coinsOwned < coinsToGive)
      return message.reply(
        `<:scrubred:797476323169533963> There's no **¢${coinsToGive}** on your pocket.`
      );

    const remainingCoins = await economy.addCoins(
      message.guild.id,
      message.member.id,
      coinsToGive * -1
    );

    const newBalance = await economy.addCoins(message.guild.id, target.id, coinsToGive);

    const givebalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `
<:scrubgreen:797476323316465676> **${target.tag}** has received **¢${coinsToGive}** from you.
**${target.tag}'s Current Wallet: ¢${newBalance}**
**Your Current Wallet: ¢${remainingCoins}**`
      )
      .setFooter("hmmmmmm")
      .setTimestamp();
    message.reply(givebalEmbed);
  }
};
