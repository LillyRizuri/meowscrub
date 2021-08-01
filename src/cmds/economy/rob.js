/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const humanizeDuration = require("humanize-duration");
const db = require("quick.db");

const economy = require("../../economy");

const { green, red } = require("../../assets/json/colors.json");

module.exports = class RobCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "rob",
      aliases: ["steal"],
      group: "economy",
      memberName: "rob",
      description: "Imagine trying to rob though. That's lame.",
      argsType: "single",
      format: "<@user>",
      examples: ["rob @frockles"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    const timeout = 30000;
    const cooldown = await db.fetch(`rob_${message.author.id}`);

    if (cooldown && cooldown - Date.now() > 0) {
      const remaining = humanizeDuration(cooldown - Date.now(), {
        round: true,
      });
      return message.reply(
        `Please refrain yourself from robbing for another **${remaining}**.`
      );
    } else {
      db.delete(`rob_${message.author.id}`);
    }

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
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> You can't rob money from me because I'm a bot, and bot can't hold any money."
        );
    }

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> Neither can you steal, or give money to them."
      );

    const isRobbed = await db.fetch(`robbed_${target.id}`);

    if (isRobbed && isRobbed - Date.now() > 0) {
      return message.reply(
        "<:scrubred:797476323169533963> That person was already robbed. Leave them alone."
      );
    } else {
      db.delete(`robbed_${target.id}`);
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

    const randomRobChance = Math.floor(Math.random() * 2 + 1);
    // 50/50 chance
    await db.set(`rob_${message.author.id}`, Date.now() + timeout);
    await db.set(`robbed_${target.id}`, Date.now() + 600000);
    switch (randomRobChance) {
      case 1: {
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
        message.reply(stolenCompleteEmbed);
        return;
      }
      case 2: {
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
        message.reply(stolenFailedEmbed);
        return;
      }
    }
  }
};
