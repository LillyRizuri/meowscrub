const Commando = require("discord.js-commando");

const economy = require("../../economy");

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

    await economy.addCoins(message.member.id, coinsToGive * -1);
    await economy.addCoins(target.id, coinsToGive);

    message.reply(
      `<:scrubgreen:797476323316465676> **${
        target.tag
      }** has received **¢${coinsToGive.toLocaleString()}** from you.`
    );
  }
};
