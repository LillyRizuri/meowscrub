const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const economy = require("../../economy");

const { green } = require("../../assets/json/colors.json");

module.exports = class AddbalCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "addbalance",
      aliases: ["addbal"],
      group: "economy",
      memberName: "addbalance",
      description: "Print & give them some money.",
      argsType: "multiple",
      argsCount: "2",
      format: "<@user> <number>",
      examples: ["addbalance @frockles 10000"],
      clientPermissions: ["MANAGE_GUILD"],
      userPermissions: ["MANAGE_GUILD"],
      guildOnly: true,
    });
  }
  async run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> Do tag a user to give them money."
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

    const coins = args[1];
    if (isNaN(coins))
      return message.reply(
        "<:scrubred:797476323169533963> Do you want to give them text instead of money?"
      );

    if (coins < 0)
      return message.reply(
        "<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value."
      );

    const guildId = message.guild.id;
    const userId = target.id;

    const newCoins = await economy.addCoins(guildId, userId, coins);

    const addbalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `
<:scrubgreen:797476323316465676> Successfully added <@${userId}> **¢${coins}**
<@${userId}>'s Current Balance: **¢${newCoins}**`
      )
      .setFooter("hmmmmmm")
      .setTimestamp();
    message.reply(addbalEmbed);
  }
};
