const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor, red } = require("../../assets/json/colors.json");

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
      format: "[@user]",
      examples: ["balance", "balance @frockles"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    let target;

    if (message.mentions.users.first()) {
      target = message.mentions.users.first();
    } else if (args) {
      target = message.guild.members.cache.get(args).user;
    } else {
      target = message.author;
    }

    if (target.bot === true) {
      const isBotEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> Neither can you check a bot's balance, or give money to them."
        )
        .setFooter("dinkus")
        .setTimestamp();
      message.reply(isBotEmbed);
      return;
    }

    const targetTag = target.tag;

    const guildId = message.guild.id;
    const userId = target.id;

    const coins = await economy.getCoins(guildId, userId);

    const balEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`${targetTag}'s Balance`)
      .setDescription(`**Balance:** ¢${coins}`)
      .setFooter("what a scrub")
      .setTimestamp();
    message.reply(balEmbed);
  }
};
