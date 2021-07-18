const Commando = require("discord.js-commando");
const { PaginatedEmbed } = require("embed-paginator");
const { version } = require("../../../package.json");

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

    const totalGuild = this.client.guilds.cache.size;

    const infoEmbed = new PaginatedEmbed({
      colours: ["RANDOM"],
      descriptions: [`2020 - 2021 ${author.tag}`],
      fields: [
        {
          name: "Stats",
          value: `
• Version: \`${version}\`
• Memory Used: \`${memUsedInMB}/${memTotalInMB}MB (${memUsedPercentage})\`        
• Library: [\`discord.js\`](https://discord.js.org/)[\`-commando\`](https://github.com/discordjs/Commando)
• Servers in: \`${totalGuild}\` 
• Online for: \`${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec\` 
          `,
        },
        {
          name: "Links",
          value: `
• [\`Client Invite\`](${clientInvite})\`|\`[\`Source Code\`](https://github.com/scrubthispie/meowscrub)\`|\`[\`Server Invite\`](${process.env.DISCORDINVITE})    
          `,
        },
        {
          name: "Special Thanks",
          value: `
• discord.js
\`A powerful node.js module that allows you to interact with the Discord API\`
• discord.js-commando
\`The official command framework for discord.js\`
• commando-provider-mongo
\`Effectively replacing SQLite Provider with MongoDB Provider for discord.js-commando\`

• mongodb
\`The database for modern applications, utilizes JSON-like documents for storing datas\`
• mongoose
\`A MongoDB object modeling tool designed to work in an asynchronous environment\`
• quick.db
\`Access & store data in a low to medium volume environment via better-sqlite3\`
          `,
        },
        {
          name: "\u200b",
          value: `
• distube
\`A discord.js module to simplify your music commands and play songs with audio filters on Discord without any API key\`
• ffmpeg-static
\`A complete, cross-platform solution to record, convert and stream audio and video\`

• weky
\`For the tic-tac-toe, fight, would-you-rather command\`
• discord-together
\`Play games or watch YouTube videos together on Discord!\`

• weather-js
\`A module for obtaining weather information from weather.service.msn.com somehow\`
• genius-lyrics-api
\`Leverages Genius API to search and fetch/scrape song lyrics and album art\`
• covidtracker
\`View information on the Coronavirus outbreak around the world\`
          `
        }
      ],
      duration: 60 * 1000,
      itemsPerPage: 2,
      paginationType: "field",
    })
      .setAuthor(
        `Client info for ${this.client.user.username}`,
        this.client.user.displayAvatarURL()
      )
      .setThumbnail(this.client.user.displayAvatarURL());

    infoEmbed.send(message.channel);
  }
};
