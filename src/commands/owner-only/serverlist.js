const Discord = require("discord.js");
const { pagination } = require("reconlx");
const botStaffSchema = require("../../models/bot-staff-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["serverlist", "servers", "guildlist", "guilds"],
  memberName: "serverlist",
  group: "owner-only",
  description: "List all servers that I'm in.",
  details: "Only the bot owner(s) and bot staff(s) may use this command.",
  hidden: true,
  callback: async (client, message) => {
    const isBotStaff = await botStaffSchema.findOne({
      userId: message.author.id,
    });

    // eslint-disable-next-line no-empty
    if (isBotStaff || client.isOwner(message.author)) {
    } else {
      return message.reply(
        emoji.denyEmoji +
          " Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s) and bot staff(s)."
      );
    }

    const clientGuilds = client.guilds.cache;

    const serverList = clientGuilds
      .sort(
        (a, b) =>
          b.members.cache.get(client.user.id).joinedTimestamp -
          a.members.cache.get(client.user.id).joinedTimestamp
      )
      .map((guild) => {
        const owner = client.users.cache.get(guild.ownerId);
        const memberCount =
          guild.memberCount -
          guild.members.cache.filter((m) => m.user.bot).size;

        const botCount = guild.members.cache.filter((m) => m.user.bot).size;

        return `**+ ${guild.name}**\n⠀• ID: \`${guild.id}\`\n⠀• Owner: \`${
          owner.tag
        } (${
          guild.ownerId
        })\`\n⠀• \`${memberCount.toLocaleString()} member(s) | ${botCount.toLocaleString()} bot(s)\`\n`;
      })
      .join("\n");

    const splitOutput = Discord.Util.splitMessage(serverList, {
      maxLength: 1024,
      char: "\n\n",
      prepend: "",
      append: "",
    });

    const embeds = [];
    for (let i = 0; i < splitOutput.length; i++) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`In ${client.guilds.cache.size} server(s) as of right now`)
        .setDescription(splitOutput[i])
        .setFooter("sorted from the latest guild join")
        .setTimestamp();
      embeds.push(embed);
    }

    pagination({
      embeds: embeds,
      author: message.author,
      channel: message.channel,
      fastSkip: true,
      time: 60000,
      button: [
        {
          name: "first",
          emoji: emoji.firstEmoji,
          style: "PRIMARY",
        },
        {
          name: "previous",
          emoji: emoji.leftEmoji,
          style: "PRIMARY",
        },
        {
          name: "next",
          emoji: emoji.rightEmoji,
          style: "PRIMARY",
        },
        {
          name: "last",
          emoji: emoji.lastEmoji,
          style: "PRIMARY",
        },
      ],
    });
  },
};
