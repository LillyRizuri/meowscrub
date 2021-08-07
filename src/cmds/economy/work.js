const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const humanizeDuration = require("humanize-duration");

const economy = require("../../economy");
const cooldowns = new Map();

const { green } = require("../../assets/json/colors.json");
const workResponse = require("../../assets/json/work-responses.json");

module.exports = class WorkCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "work",
      group: "economy",
      memberName: "work",
      description: "Work to get yourself money.",
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
        `You may not use the \`work\` command again for another ${remaining}.`
      );
    }

    const rngCoins = Math.floor(Math.random() * 1400 + 100);
    const randomWorkResponse = workResponse[Math.floor(Math.random() * workResponse.length)];

    await economy.addCoins(message.author.id, rngCoins);

    const addbalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(randomWorkResponse)
      .setFooter(`Money Got: ¢${rngCoins.toLocaleString()}`)
      .setTimestamp();
    message.channel.send(addbalEmbed);

    await economy.bankCapIncrease(message.author.id);

    cooldowns.set(message.author.id, Date.now() + 30000);
    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, 30000);
  }
};
