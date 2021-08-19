const Discord = require("discord.js");
const { version } = require("../../../package.json");

module.exports = {
  aliases: ["info", "botinfo"],
  memberName: "info",
  group: "info",
  description: "Display the client's stats.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  callback: async (client, message) => {
    let totalSeconds = client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const clientInvite = client.generateInvite({
      scopes: ["applications.commands", "bot"],
      // eslint-disable-next-line no-undef
      permissions: BigInt(258171333879),
    });

    console.log(clientInvite);

    const memUsed = process.memoryUsage().heapUsed;
    const memTotal = process.memoryUsage().heapTotal;
    const memUsedInMB = (memUsed / 1024 / 1024).toFixed(2);
    const memTotalInMB = (memTotal / 1024 / 1024).toFixed(2);

    const memUsedPercentage = ((memUsed / memTotal) * 100).toFixed(2) + "%";
    const author = await client.users.fetch(process.env.OWNERS);

    const totalGuild = client.guilds.cache.size;

    const infoEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(
        `Client info for ${client.user.username}`,
        client.user.displayAvatarURL()
      )
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "Stats",
          value: `
• Version: \`${version}\`
• Memory Used: \`${memUsedInMB}/${memTotalInMB}MB (${memUsedPercentage})\`        
• Library: [\`discord.js v13\`](https://discord.js.org/)
• Servers in: \`${totalGuild}\` 
• Online for: \`${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec\` 
      `,
        },
        {
          name: "Links",
          value: `
• [\`Client Invite\`](${clientInvite})\`|\`[\`Source Code\`](https://github.com/scrubthispie/meowscrub)\`|\`[\`Server Invite\`](${process.env.DISCORDINVITE})    
      `,
        }
      )
      .setFooter(`2020 - 2021 ${author.tag}`);
    message.channel.send({ embeds: [infoEmbed] });
  },
};
