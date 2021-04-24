const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

const economy = require("../../economy");

module.exports = class BalCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "balance",
      aliases: ["bal"],
      group: "economy",
      memberName: "balance",
      description: "Check your/someone else's pocket.",
      argsType: "single",
      format: "[@user/userID]",
      examples: ["balance", "balance @frockles"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    let target;

    try {
      if (!args) {
        target = message.author;
      } else if (args) {
        target =
          message.mentions.users.first() ||
          message.guild.members.cache.get(args).user;
      }
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What is that User ID."
      );
    }
    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> Neither can you check a bot's balance, or give money to them."
      );

    const targetTag = target.tag;

    const guildId = message.guild.id;
    const userId = target.id;

    const coins = await economy.getCoins(guildId, userId);
    const coinBank = await economy.getCoinBank(guildId, userId);

    const balEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`${targetTag}'s Balance`)
      .setDescription(`**Wallet:** ¢${coins}\n**Bank:** ¢${coinBank}`)
      .setFooter("what a scrub")
      .setTimestamp();
    message.reply(balEmbed);
  }
};
