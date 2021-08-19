const Discord = require("discord.js");
const moment = require("moment");
const botStaffSchema = require("../../models/bot-staff-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["serverinfo", "guildinfo", "svinfo"],
  memberName: "serverinfo",
  group: "util",
  description: "Display informations related to this server.",
  details:
    "Only the bot owner(s) and bot staff(s) may utilize the argument parameter.",
  format: "[guildID]",
  examples: ["serverinfo", "serverinfo 692346925428506777"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let guild;
    const dateTimeOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    };

    const isBotStaff = await botStaffSchema.findOne({
      userId: message.author.id,
    });

    if (!args) {
      guild = message.guild;
    } else if (args) {
      if (isBotStaff || client.isOwner(message.author)) {
        guild = client.guilds.cache.get(args);
      } else {
        guild = message.guild;
      }
    }

    if (!guild)
      return message.reply(
        emoji.denyEmoji +
          " That is NOT a valid Guild ID. But if it's valid, make sure that I'm in that provided server."
      );

    const serverOwner = await client.users.fetch(guild.ownerId);

    const createdAt = new Date(guild.createdAt).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    const createdAtFromNow = moment(guild.createdAt).fromNow();

    const allRoles = (guild.roles.cache.size - 1).toLocaleString();

    const allEmojis = guild.emojis.cache.size.toLocaleString();

    const allBoosts = guild.premiumSubscriptionCount.toLocaleString();

    const serverTier = guild.premiumTier
      .replace("NONE", "Tier 0")
      .replace("TIER_", "Tier ");

    const memberCount = (
      guild.memberCount - guild.members.cache.filter((m) => m.user.bot).size
    ).toLocaleString();

    const botCount = guild.members.cache
      .filter((m) => m.user.bot)
      .size.toLocaleString();

    const maximumMembers = guild.maximumMembers.toLocaleString();

    const guildDescription = guild.description
      ? `${guild.description}`
      : "None";

    const rulesChannel = guild.channels.cache.get(guild.rulesChannelId)
      ? `#${guild.channels.cache.get(guild.rulesChannelId).name}`
      : "None";

    const systemChannel = guild.channels.cache.get(guild.rulesChannelId)
      ? `#${guild.channels.cache.get(guild.rulesChannelId).name}`
      : "None";

    const textChannels = guild.channels.cache.filter(
      (channel) => channel.type == "GUILD_TEXT"
    ).size;

    const voiceChannels = guild.channels.cache.filter(
      (channel) => channel.type == "GUILD_VOICE"
    ).size;

    const parentChannels = guild.channels.cache.filter(
      (channel) => channel.type == "GUILD_CATEGORY"
    ).size;

    const newsChannels = guild.channels.cache.filter(
      (channel) => channel.type == "GUILD_NEWS"
    ).size;

    let afkChannel = "";
    let afkTimeout = "";
    if (guild.afkChannelId) {
      afkChannel = `"${guild.channels.cache.get(guild.afkChannelId).name}"`;
      afkTimeout = ` - ${guild.afkTimeout}s Timeout`;
    } else if (!guild.afkChannelId) {
      afkChannel = "None";
    }

    const defaultMsgNotif = guild.defaultMessageNotifications
      .replace("ALL_MESSAGES", "all messages")
      .replace("ONLY_MENTIONS", "only @mentions");

    const explicitContentFilter = guild.explicitContentFilter
      .split("_")
      .join(" ")
      .toProperCase();

    const verificationLevel = guild.verificationLevel
      .split("_")
      .join(" ")
      .toProperCase()
      .replace("Very High", "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻")
      .replace("High", "(╯°□°）╯︵ ┻━┻");

    const communityFeatures =
      guild.features
        .join(", ")
        .toString()
        .split("_")
        .join(" ")
        .toProperCase() || "No Community Features";

    const serverInfoEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(`Reports for: ${guild.name}`, guild.iconURL())
      .setThumbnail(guild.iconURL({ format: "png", dynamic: true }))
      .addFields(
        {
          name: "Overview",
          value: `
• Owner: \`${serverOwner.tag} | ID: ${serverOwner.id}\`
• Created: \`${createdAt} (${createdAtFromNow})\`
• Description: \`${guildDescription}\`
• \`${memberCount} Member(s) | ${botCount} Bot(s) | Maximum of ${maximumMembers} members\`
• \`${allRoles} Role(s) | ${allEmojis} Emoji(s) | ${allBoosts} Boost(s) | ${serverTier}\`
• \`Everyone will receive ${defaultMsgNotif} by default\`   
          `,
        },
        {
          name: "Server Protection",
          value: `
• Verification Level: \`${verificationLevel}\`
• Explicit Content Filter: \`${explicitContentFilter}\`
          `,
        },
        {
          name: "All Channels",
          value: `
• Rules Channel: \`${rulesChannel}\`
• System Channel: \`${systemChannel}\`          
• AFK Voice Channel: \`${afkChannel}${afkTimeout}\`
• \`${textChannels} Text Ch. | ${voiceChannels} Voice Ch. | ${parentChannels} Category Ch. | ${newsChannels} News Ch.\`
          `,
        },
        {
          name: "Community Features",
          value: `• \`${communityFeatures}\``,
        }
      )
      .setFooter(`GuildID: ${guild.id}`)
      .setTimestamp();
    message.channel.send({ embeds: [serverInfoEmbed] });
  },
};
