const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class BotUptimeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "uptime",
      group: "utility",
      memberName: "uptime",
      description: "Shows how long I am awake.",
    });
  }

  run(message) {
    let totalSeconds = this.client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const uptimeEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`${this.client.user.username}'s Current Uptime`)
      .setDescription(
        `\`\`\`css\n${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec\`\`\``
      )
      .setFooter("imagine uptime exceeds to 1 day")
      .setTimestamp();
    message.channel.send(uptimeEmbed);
  }
};
