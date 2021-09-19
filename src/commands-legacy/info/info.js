const Discord = require("discord.js");

const botInfoSchema = require("../../models/bot-info-schema");

const { version } = require("../../../package.json");
const { dependencies } = require("../../../package.json");

module.exports = {
  aliases: ["info", "botinfo"],
  memberName: "info",
  group: "info",
  description: "Display the client's stats.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
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

    const memUsed = process.memoryUsage().heapUsed;
    const memTotal = process.memoryUsage().heapTotal;
    const memUsedInMB = (memUsed / 1024 / 1024).toFixed(2);
    const memTotalInMB = (memTotal / 1024 / 1024).toFixed(2);

    const memUsedPercentage = ((memUsed / memTotal) * 100).toFixed(2) + "%";
    const author = await client.users.fetch(client.settings.owner[0]);

    const totalGuild = client.guilds.cache.size;

    const discordJSVer = dependencies["discord.js"].replace("^", "");

    let botInfo = await botInfoSchema.findOne();
    if (!botInfo) {
      await new botInfoSchema({
        cmdsExecuted: 0,
      }).save();

      botInfo = await botInfoSchema.findOne();
    }

    const infoEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(
        `Client info for ${client.user.username}`,
        client.user.displayAvatarURL()
      )
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "Client Version",
          value: version.toString(),
          inline: true,
        },
        {
          name: "Library",
          value: `[discord.js@${discordJSVer}](https://discord.js.org/)`,
          inline: true,
        },
        {
          name: "Total Servers",
          value: `${totalGuild.toLocaleString()} Servers`,
          inline: true,
        },
        {
          name: "Memory Used",
          value: `${memUsedInMB}/${memTotalInMB}MB (${memUsedPercentage})`,
          inline: true,
        },
        {
          name: "Online for",
          value: `${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec`,
          inline: true,
        },
        {
          name: "Links",
          value: `
[Bot Invite](${clientInvite}) | [Source Code](https://github.com/scrubthispie/meowscrub) | [Server Invite](${process.env.DISCORDINVITE})    
`,
        },
        {
          name: "Voting Site",
          value: `
[top.gg](https://top.gg/bot/${client.user.id})
`,
        }
      )
      .setFooter(`2020 - 2021 ${author.tag} | ${botInfo.cmdsExecuted.toLocaleString()} commands executed`);
    message.channel.send({ embeds: [infoEmbed] });
  },
};
