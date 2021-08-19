const Discord = require("discord.js");

const economy = require("../../util/economy");

const emoji = require("../../assets/json/tick-emoji.json");
const { embedcolor } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["balance", "bal"],
  memberName: "balance",
  group: "economy",
  description: "Check your/someone else's balance.",
  format: "[@user/userID]",
  examples: ["balance", "balance @frockles", "balance 693832549943869493"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
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
      return message.reply(emoji.denyEmoji + " What is that User ID.");
    }

    if (target.bot === true)
      return message.reply(
        emoji.denyEmoji +
          " Neither can you check a bot's balance, or give money to them."
      );

    const targetTag = target.tag;
    const userId = target.id;

    const coins = await economy.getCoins(userId);
    const coinBank = await economy.getCoinBank(userId);
    const bankCap = await economy.getBankCap(userId);

    const balEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`${targetTag}'s Balance`)
      .setFooter("interesting")
      .setTimestamp();

    if (!args)
      balEmbed.addFields(
        {
          name: "Wallet",
          value: `\`\`\`css\n¢${coins.toLocaleString()}\`\`\``,
          inline: true,
        },
        {
          name: "Bank",
          value: `\`\`\`css\n¢${coinBank.toLocaleString()} / ${bankCap.toLocaleString()}\`\`\``,
          inline: true,
        }
      );
    else if (args)
      balEmbed.addFields(
        {
          name: "Wallet",
          value: `\`\`\`css\n¢${coins.toLocaleString()}\`\`\``,
          inline: true,
        },
        {
          name: "Bank",
          value: `\`\`\`css\n¢${coinBank.toLocaleString()}\`\`\``,
          inline: true,
        }
      );
    message.channel.send({ embeds: [balEmbed] });
  },
};
