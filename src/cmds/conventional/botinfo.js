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
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    let totalMembers = 0;

    let totalSeconds = this.client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const clientInvite = `https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&permissions=473295991&scope=bot%20applications.commands`;

    const memUsed = process.memoryUsage().heapUsed;
    const memTotal = process.memoryUsage().heapTotal;
    const memUsedInMB = (memUsed / 1024 / 1024).toFixed(2);
    const memTotalInMB = (memTotal / 1024 / 1024).toFixed(2);

    const memUsedPercentage = ((memUsed / memTotal) * 100).toFixed(2) + "%";
    const author = await this.client.users.fetch(process.env.OWNERID);

    for (const guild of this.client.guilds.cache) {
      totalMembers += (await guild[1].members.fetch()).size;
    }

    const totalGuild = this.client.guilds.cache.size;

    const botinfoEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(
        `Client info for ${this.client.user.username}`,
        this.client.user.displayAvatarURL()
      )
      .setThumbnail(this.client.user.displayAvatarURL())
      .addFields(
        {
          name: "Stats",
          value: `
• Version: \`${version}\`
• Memory Used: \`${memUsedInMB}/${memTotalInMB}MB (${memUsedPercentage})\`        
• Library: [\`discord.js\`](https://discord.js.org/)[\`-commando\`](https://github.com/discordjs/Commando)
• \`In ${totalGuild} Server(s) | Serving ${totalMembers} Member(s)\` 
• \`Online for ${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec\` 
          `,
        },
        {
          name: "Links",
          value: `
• [\`Client Invite\`](${clientInvite})\`|\`[\`Source Code\`](https://github.com/scrubthispie/meowscrub)\`|\`[\`Server Invite\`](${process.env.DISCORDINVITE})    
          `,
        }
      )
      .setFooter(
        `2020 - 2021 ${author.tag}`
      );
    message.channel.send(botinfoEmbed);
  }
};
