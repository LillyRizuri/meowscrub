const Discord = require("discord.js");
const moment = require("moment");
const botStaffSchema = require("../../models/bot-staff-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["serverinfo", "guildinfo", "server", "guild"],
  memberName: "serverinfo",
  group: "util",
  description: "Display informations related to this server.",
  details:
    "Only the bot owner(s) and bot staff(s) may utilize the argument parameter.",
  format: "[guildID]",
  examples: ["serverinfo", "serverinfo 692346925428506777"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let guild;
    const dateTimeOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
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
    const normalEmojis = guild.emojis.cache.filter((e) => !e.animated).size;
    const animatedEmojis = guild.emojis.cache.filter((e) => e.animated).size;

    const allBoosts = guild.premiumSubscriptionCount.toLocaleString();

    const serverTierSplit = guild.premiumTier
      .replace("NONE", "TIER_0")
      .split("_");
    const serverTier = guild.premiumTier
      .replace("NONE", "TIER_0")
      .replace(serverTierSplit[1], `**${serverTierSplit[1]}**`)
      .replaceAll("_", " ")
      .toProperCase();

    const memberCount = (
      guild.memberCount - guild.members.cache.filter((m) => m.user.bot).size
    ).toLocaleString();

    const botCount = guild.members.cache
      .filter((m) => m.user.bot)
      .size.toLocaleString();

    const maximumMembers = guild.maximumMembers.toLocaleString();

    const guildDescription = guild.description
      ? `"${guild.description}"`
      : "No server description found.";

    const allChannels = guild.channels.cache.size;

    const rulesChannel = guild.channels.cache.get(guild.rulesChannelId)
      ? guild.channels.cache.get(guild.rulesChannelId)
      : "None";

    const systemChannel = guild.channels.cache.get(guild.systemChannelId)
      ? guild.channels.cache.get(guild.systemChannelId)
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
      afkChannel = guild.channels.cache.get(guild.afkChannelId);
      afkTimeout = `(${guild.afkTimeout}s Timeout)`;
    } else if (!guild.afkChannelId) {
      afkChannel = "None";
    }

    const defaultMsgNotif = guild.defaultMessageNotifications
      .replace("ALL_MESSAGES", "All Messages")
      .replace("ONLY_MENTIONS", "Only @mentions");

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
      .setDescription(
        `**${allBoosts}** Boost(s) | ${serverTier}\n${guildDescription}`
      )
      .addFields(
        {
          name: "Owner",
          value: `${serverOwner.tag} (${serverOwner.id})`,
        },
        {
          name: `${guild.memberCount}/${maximumMembers} Members`,
          value: `**${memberCount}** Member(s) | **${botCount}** Bot(s)`,
        },
        {
          name: "Created",
          value: `${createdAt} (${createdAtFromNow})`,
          inline: true,
        },
        {
          name: `${allEmojis} Emoji(s)`,
          value: `• **${normalEmojis}** Normal\n• **${animatedEmojis}** Animated`,
          inline: true,
        },
        {
          name: "No. of Roles",
          value: allRoles,
          inline: true,
        },
        {
          name: "Server Settings & Protection",
          value: `
• Verification Level: **${verificationLevel}**
• Explicit Content Filter: **${explicitContentFilter}**
• Default Message Notification: **${defaultMsgNotif}**
          `
        },
        {
          name: "Channel Config.",
          value: `
• Rules Channel: **${rulesChannel}**
• System Channel: **${systemChannel}**
• AFK Voice Channel: **${afkChannel}**\n${afkTimeout}
          `,
          inline: true,
        },
        {
          name: `${allChannels} Channel(s)`,
          value: `
• **${textChannels}** Text Channels
• **${voiceChannels}** Voice Channels
• **${newsChannels}** Announcement Channels
• **${parentChannels}** Categories
          `,
          inline: true,
        },
        {
          name: "Community Features",
          value: `${communityFeatures}`,
        }
      )
      .setFooter(`GuildID: ${guild.id}`)
      .setTimestamp();
    message.channel.send({ embeds: [serverInfoEmbed] });
  },
};
