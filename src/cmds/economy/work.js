const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const humanizeDuration = require("humanize-duration");

const economy = require("../../economy");
const cooldowns = new Map();

const { green } = require("../../assets/json/colors.json");
const workResponse = require("../../assets/json/work-cmd-responses.json");

module.exports = class WorkCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "work",
      aliases: ["lolwork"],
      group: "economy",
      memberName: "work",
      description: "Work to get yourself money.",
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
    const guildId = message.guild.id;
    const rngCoins = Math.floor(Math.random() * 1500 + 200);
    const randomWorkResponse = Math.floor(Math.random() * workResponse.length);

    await economy.addCoins(guildId, message.author.id, rngCoins);

    const addbalEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(workResponse[randomWorkResponse])
      .setFooter(`Money Got: ¢${rngCoins}`)
      .setTimestamp();
    message.channel.send(addbalEmbed);

    cooldowns.set(message.author.id, Date.now() + 30000);
    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, 30000);
  }
};
