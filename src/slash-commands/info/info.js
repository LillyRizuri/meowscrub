const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const botInfoSchema = require("../../models/bot-info-schema");

const { version } = require("../../../package.json");
const { dependencies } = require("../../../package.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Display the client's stats."),
  group: "info",
  clientPermissions: ["EMBED_LINKS"],
  callback: async (client, interaction) => {
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
    const author = await client.users.fetch(client.owner[0]);

    const totalGuild = client.guilds.cache.size;
    const totalMembers = client.users.cache.filter((u) => !u.bot).size;

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
          name: "Total Servers & Members",
          value: `${totalGuild.toLocaleString()} Servers | ${totalMembers.toLocaleString()} Members`,
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
          name: "Command Execution",
          value: `${botInfo.cmdsExecuted.toLocaleString()} Success | ${botInfo.cmdsExecutedFails.toLocaleString()} Failed`,
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
      .setFooter(`2020 - 2021 ${author.tag}`);
    interaction.reply({ embeds: [infoEmbed] });
  },
};
