const Discord = require("discord.js");

const economy = require("../../util/economy");

const { green, red } = require("../../assets/json/colors.json");
const successResp = require("../../assets/json/beg-response.json");
const failedResp = require("../../assets/json/beg-fail-response.json");

const a = 100000,
  b = 300000;

module.exports = {
  aliases: ["beg"],
  memberName: "beg",
  group: "economy",
  description: "Pretend being poor to others!",
  details:
    "The more money you have on hand, the less money a random person is going to give you, and higher chance to fail.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 30,
  guildOnly: true,
  callback: async (client, message) => {
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

    message.channel.send({ embeds: [embed] });

    await economy.bankCapIncrease(message.author.id);
  },
};
