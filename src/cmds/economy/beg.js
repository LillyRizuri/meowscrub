const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const humanizeDuration = require("humanize-duration");

const economy = require("../../economy");
const cooldowns = new Map();

const { green, red } = require("../../assets/json/colors.json");
const successResp = require("../../assets/json/beg-response.json");
const failedResp = require("../../assets/json/beg-fail-response.json");

const a = 100000,
  b = 300000;

module.exports = class BegCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "beg",
      group: "economy",
      memberName: "beg",
      description: "Pretend that you are poor!",
      details:
        "The more money you have on hand, the less money a random person is going to give you, and higher chance to fail.",
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }
  async run(message) {
    const cooldown = cooldowns.get(message.author.id);
    if (cooldown) {
      const remaining = humanizeDuration(cooldown - Date.now(), {
        round: true,
      });
      return message.reply(
        `You may not use the \`beg\` command again for another ${remaining}.`
      );
    }

    let rngCoins = Number(),
      chance = Number();

    const coinsOwned = await economy.getCoins(message.author.id);

    if (coinsOwned < a)
      (rngCoins = Math.floor(Math.random() * 400 + 100)),
        (chance = Math.floor(Math.random() * 4));
    else if (a < coinsOwned < b)
      (rngCoins = Math.floor(Math.random() * 200 + 100)),
        (chance = Math.floor(Math.random() * 3));
    else if (b < coinsOwned)
      (rngCoins = Math.floor(Math.random() * 100 + 100)),
        (chance = Math.floor(Math.random() * 2));

    const embed = new Discord.MessageEmbed()
      .setAuthor("some random person")
      .setTimestamp();

    switch (chance) {
      case 0: {
        const response =
          failedResp[Math.floor(Math.random() * failedResp.length)];

        embed
          .setColor(red)
          .setDescription(`"${response}"`)
          .setFooter("failed, huh?");
        break;
      }
      default: {
        const response =
          successResp[Math.floor(Math.random() * successResp.length)];

        await economy.addCoins(message.author.id, rngCoins);

        embed
          .setColor(green)
          .setDescription(
            `"${response
              .split("{money}")
              .join(`**¢${rngCoins.toLocaleString()}**`)}"`
          )
          .setFooter("it worked?");
        break;
      }
    }

    message.channel.send(embed);

    await economy.bankCapIncrease(message.author.id);

    cooldowns.set(message.author.id, Date.now() + 30000);
    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, 30000);
  }
};
