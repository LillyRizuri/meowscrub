/* eslint-disable no-case-declarations */
const Discord = require("discord.js");

const economy = require("../../util/economy");

const areRobbed = new Map();

const { green, red } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["rob", "steal"],
  memberName: "rob",
  group: "economy",
  description: "Imagine trying to rob though. That's lame.",
  format: "<@user>",
  examples: ["rob @frockles"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 30,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> You ain't gonna steal from somebody?"
      );

    const target = message.mentions.users.first();

    if (!target)
      return message.reply(
        "<:scrubred:797476323169533963> You can only mention a target."
      );

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Robbing yourself? You're joking, right?"
        );
      case client.user:
        return message.reply(
          "<:scrubred:797476323169533963> You can't rob money from me because I'm a bot, and bot can't hold any money."
        );
    }

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> Neither can you steal, or give money to them."
      );

    const isRobbed = areRobbed.get(target.id);

    if (isRobbed) {
      return message.reply(
        "<:scrubred:797476323169533963> That person was already robbed. Leave them alone."
      );
    }

    const robberBal = await economy.getCoins(message.author.id);
    if (robberBal < 10000)
      return message.reply(
        "<:scrubred:797476323169533963> You need at least **¢10,000** to try and rob someone."
      );

    const targetBal = await economy.getCoins(target.id);
    if (targetBal < 2000)
      return message.reply(
        "<:scrubred:797476323169533963> You can't rob from a person with little cash on hand. Get out of my sight."
      );

    const randomRobChance = Math.floor(Math.random() * 2);
    // 50/50 chance
    areRobbed.set(target.id, Date.now() + 120000);
    setTimeout(() => {
      areRobbed.delete(target.id);
    }, 120000);
    switch (randomRobChance) {
      case 0: {
        const coinsToSteal = Math.floor(Math.random() * (targetBal / 2));

        await economy.addCoins(target.id, coinsToSteal * -1);

        const robberCoins = await economy.addCoins(
          message.author.id,
          coinsToSteal
        );

        const stolenCompleteEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `
<:scrubgreen:797476323316465676> You robbed **¢${coinsToSteal.toLocaleString()}** out of **${
              target.tag
            }**. 
**Now you have: ¢${robberCoins.toLocaleString()}**
`
          )
          .setFooter("ruthless.")
          .setTimestamp();
        message.reply({ embeds: [stolenCompleteEmbed] });
        break;
      }
      default: {
        const coinsToPayback = Math.floor(Math.random() * (robberBal / 2));

        await economy.addCoins(target.id, coinsToPayback);
        await economy.addCoins(message.author.id, coinsToPayback * -1);

        const stolenFailedEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            `<:scrubred:797476323169533963> **You got caught LMAOOOOO**\nYou paid the person you attempted to stole **¢${coinsToPayback.toLocaleString()}**.`
          )
          .setFooter("psych")
          .setTimestamp();
        message.reply({ embeds: [stolenFailedEmbed] });
        break;
      }
    }
  },
};
