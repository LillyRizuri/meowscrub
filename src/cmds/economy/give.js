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
      guildOnly: true,
    });
  }

  async run(message, args) {
    const { guild, member } = message;

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

    const coinsOwned = await economy.getCoins(guild.id, member.id);
    if (coinsOwned < coinsToGive)
      return message.reply(
        `<:scrubred:797476323169533963> There's no **¢${coinsToGive}** on your pocket.`
      );

    const remainingCoins = await economy.addCoins(
      guild.id,
      member.id,
      coinsToGive * -1
    );

    const newBalance = await economy.addCoins(guild.id, target.id, coinsToGive);

    const givebalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `
<:scrubgreen:797476323316465676> <@${target.id}> has received **¢${coinsToGive}** from you!
<@${target.id}>'s Current Balance: **¢${newBalance}**
Your Current Balance: **¢${remainingCoins}**`
      )
      .setFooter("hmmmmmm")
      .setTimestamp();
    message.reply(givebalEmbed);
  }
};
