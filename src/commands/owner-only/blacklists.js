const Discord = require("discord.js");
const { pagination } = require("reconlx");
const botStaffSchema = require("../../models/bot-staff-schema");
const userBlacklistSchema = require("../../models/user-blacklist-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["blacklists", "blacklisted", "botbans"],
  memberName: "blacklists",
  group: "owner-only",
  description: "List all accounts that are blacklisted.",
  details: "Only the bot owner(s) and bot staff(s) may use this command.",
  guarded: true,
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

    const dateTimeOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    };

    let results = await userBlacklistSchema.find();
    results = results.sort((a, b) => b.timestamp - a.timestamp);
    const blacklistedUsers = [];

    for (const result of results) {
      const blacklistedAt = new Date(result.timestamp).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      blacklistedUsers.push({
        user: await client.users.fetch(result.userId),
        date: blacklistedAt,
      });
    }

    console.log(blacklistedUsers);

    let blacklistedList = "";

    for (const data of blacklistedUsers) {
      blacklistedList += `**+ ${data.user.tag}**\n⠀• ID: \`${data.user.id}\`\n⠀• Date of Blacklist: \`${data.date}\`\n\n`;
    }

    const splitOutput = Discord.Util.splitMessage(blacklistedList, {
      maxLength: 1024,
      char: "\n\n",
      prepend: "",
      append: "",
    });

    const embeds = [];
    for (let i = 0; i < splitOutput.length; i++) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(`${results.length} blacklisted`)
        .setDescription(splitOutput[i])
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
