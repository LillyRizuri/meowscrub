const Discord = require("discord.js");

const economy = require("../../util/economy");
const { green } = require("../../assets/json/colors.json");
const workResponse = require("../../assets/json/work-responses.json");

module.exports = {
  aliases: ["work"],
  memberName: "work",
  group: "economy",
  description: "Work to get yourself money.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 30,
  guildOnly: true,
  callback: async (client, message) => {
    const rngCoins = Math.floor(Math.random() * 1400 + 100);
    const randomWorkResponse =
      workResponse[Math.floor(Math.random() * workResponse.length)];

    await economy.addCoins(message.author.id, rngCoins);

    const addbalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(randomWorkResponse)
      .setFooter(`Money Got: ¢${rngCoins.toLocaleString()}`)
      .setTimestamp();
    await message.channel.send({ embeds: [addbalEmbed] });

    await economy.bankCapIncrease(message.author.id);
  },
};
