const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { version } = require("../../../package.json");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class BotInfoCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "botinfo",
      group: "conventional",
      memberName: "botinfo",
      description: "Get and display my informations.",
    });
  }

  async run(message) {
    let totalMembers = 0;
    let author;

    let totalSeconds = this.client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

    this.client.users.fetch(process.env.OWNERID).then(async (user) => {
      author = user.tag;
    });

    for (const guild of this.client.guilds.cache) {
      totalMembers += (await guild[1].members.fetch()).size;
    }

    const botinfoEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(
        `${this.client.user.username}`,
        this.client.user.displayAvatarURL()
      )
      .addFields(
        {
          name: "Client Version",
          value: version,
          inline: true,
        },
        {
          name: "Library",
          value: "discord.js",
          inline: true,
        },
        {
          name: "Framework",
          value: "discord.js-commando",
          inline: true,
        },
        {
          name: "Bot Creator",
          value: author,
          inline: true,
        },
        {
          name: "Servers Currently In",
          value: this.client.guilds.cache.size,
          inline: true,
        },
        {
          name: "Members Served",
          value: totalMembers,
          inline: true,
        },
        {
          name: "Invite the Bot",
          value: `[Official Client Invite](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2083911167)`,
          inline: true,
        },
        {
          name: "Support/Community",
          value: "[Server Invite](https://discord.gg/fqE2yrA)",
          inline: true,
        }
      )
      .setFooter(
        `Current Uptime: ${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec`
      );
    message.channel.send(botinfoEmbed);
  }
};
