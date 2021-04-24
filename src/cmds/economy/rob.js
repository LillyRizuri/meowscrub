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
      description: "Imagine trying to rob though.",
      argsType: "single",
      format: "<@user>",
      examples: ["rob @frockles"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    const timeout = 86400000;
    const cooldown = await db.fetch(
      `rob_${message.guild.id}_${message.author.id}`
    );

    if (cooldown !== null && cooldown - Date.now() > 0) {
      const remaining = humanizeDuration(cooldown - Date.now(), {
        round: true,
      });
      return message.reply(`Please refrain yourself from robbing for another **${remaining}**.`);
    }

    const guildId = message.guild.id;

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

    const robberBal = await economy.getCoins(guildId, message.author.id);
    if (robberBal < 10000)
      return message.reply(
        "<:scrubred:797476323169533963> You need at least **¢10000** to try and rob someone."
      );

    const targetBal = await economy.getCoins(guildId, target.id);
    if (targetBal < 2000)
      return message.reply(
        "<:scrubred:797476323169533963> You can't rob from a person with little cash on hand. Get out of my sight."
      );

    const randomRobChance = Math.floor(Math.random() * 2 + 1);
    // 50/50 chance
    await db.set(
      `rob_${message.guild.id}_${message.author.id}`,
      Date.now() + timeout
    );
    switch (randomRobChance) {
      case 1: {
        const coinsToSteal = Math.floor(Math.random() * (targetBal / 2));

        await economy.addCoins(guildId, target.id, coinsToSteal * -1);

        const robberCoins = await economy.addCoins(
          guildId,
          message.author.id,
          coinsToSteal
        );

        const stolenCompleteEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `
<:scrubgreen:797476323316465676> You robbed **¢${coinsToSteal}** out of **${target.tag}**. 
**Now you have: ¢${robberCoins}**
`
          )
          .setFooter("ruthless.")
          .setTimestamp();
        message.reply(stolenCompleteEmbed);
        return;
      }
      case 2: {
        const coinsToPayback = Math.floor(
          Math.random() * ((robberBal - 10000) / 2)
        );

        await economy.addCoins(guildId, target.id, coinsToPayback);
        await economy.addCoins(guildId, message.author.id, coinsToPayback * -1);

        const stolenFailedEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            `<:scrubred:797476323169533963> **You got caught LMAOOOOO**\nYou paid the person you attempted to stole **¢${coinsToPayback}**.`
          )
          .setFooter("sike")
          .setTimestamp();
        message.reply(stolenFailedEmbed);
        return;
      }
    }
  }
};
