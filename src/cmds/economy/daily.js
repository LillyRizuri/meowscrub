const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const moment = require("moment");
const humanizeDuration = require("humanize-duration");

const economy = require("../../economy");

const economySchema = require("../../models/economy-schema");

module.exports = class DailyCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "daily",
      group: "economy",
      memberName: "daily",
      description: `Claim your daily rewards after every 00:00 ${
        Intl.DateTimeFormat().resolvedOptions().timeZone
      }`,
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message) {
    let results = await economySchema.findOne({
      userId: message.author.id,
    });

    if (!results) {
      await new economySchema({
        userId: message.author.id,
        coins: 0,
        coinBank: 0,
        dailyStreak: 1,
        dailyLastClaimed: 0,
        bankCapacity: 500,
        inventory: [],
      }).save();

      results = await economySchema.findOne({
        userId: message.author.id,
      });
    }

    const baseCoin = 25000;
    const streakReward = 250;

    let then = new Date(results.dailyLastClaimed);
    then.setHours(0);
    then.setMinutes(0);
    then.setSeconds(0);

    then = moment(then).utcOffset("+0000");

    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    now = moment(now).utcOffset("+0000");

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);

    tomorrow = moment(tomorrow).utcOffset("+0000");

    const diffTime = Math.abs(now - then);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const remaining = humanizeDuration(tomorrow - new Date(), {
      round: true,
    });

    if (diffDays < 1) {
      const noDailyYet = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle("You've already claimed your daily for today")
        .setDescription(`Please check back after:\n**${remaining}**`)
        .setFooter(
          `Daily resets at 00:00 ${
            Intl.DateTimeFormat().resolvedOptions().timeZone
          }`
        );

      return message.reply(noDailyYet);
    }

    if (diffDays === 1)
      await economySchema.findOneAndUpdate(
        {
          userId: message.author.id,
        },
        {
          userId: message.author.id,
          dailyStreak: results.dailyStreak + 1,
          dailyLastClaimed: new Date().getTime(),
        }
      );
    else if (diffDays > 1)
      await economySchema.findOneAndUpdate(
        {
          userId: message.author.id,
        },
        {
          userId: message.author.id,
          dailyStreak: 1,
          dailyLastClaimed: new Date().getTime(),
        }
      );

    results = await economySchema.findOne({
      userId: message.author.id,
    });

    const totalRewards = baseCoin + streakReward * results.dailyStreak;

    await economy.addCoins(message.author.id, totalRewards);

    const dailyClaimedEmbed = new Discord.MessageEmbed()
      .setTitle(`Your daily reward is here, ${message.author.username}`)
      .setColor("RANDOM")
      .setDescription(
        `
**¢${totalRewards.toLocaleString()}** was added into your wallet!

Your next daily will be ready in:
**${remaining}**
`
      )
      .setFooter(
        `Streak: ${results.dailyStreak} day(s) [+¢${(
          streakReward * results.dailyStreak
        ).toLocaleString()}]`
      );

    message.channel.send(dailyClaimedEmbed);
  }
};
