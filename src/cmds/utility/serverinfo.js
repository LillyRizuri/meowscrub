const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const moment = require("moment");
const botStaffSchema = require("../../models/bot-staff-schema");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class ServerInfoCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "serverinfo",
      aliases: ["guildinfo", "svinfo"],
      group: "utility",
      memberName: "serverinfo",
      description: "Shows some informations about this very guild.",
      argsType: "single",
      format: "[guildID]",
      examples: ["serverinfo", "serverinfo 692346925428506777"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
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
      if (isBotStaff || this.client.isOwner(message.author)) {
        guild = this.client.guilds.cache.get(args);
      } else {
        guild = message.guild;
      }
    }

    if (!guild)
      return message.reply(
        "<:scrubred:797476323169533963> That is NOT a valid Guild ID. But if it's valid, make sure that I'm in that provided server."
      );

    const serverOwner = await this.client.users.fetch(guild.ownerID);

    const createdAt = new Date(guild.createdAt).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    const createdAtFromNow = moment(guild.createdAt).fromNow();

    const allRoles = (guild.roles.cache.size - 1).toLocaleString();

    const allEmojis = guild.emojis.cache.size.toLocaleString();

    const allBoosts = guild.premiumSubscriptionCount.toLocaleString();

    const serverTier = guild.premiumTier.toLocaleString();

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

    const rulesChannel = guild.rulesChannelID
      ? `#${guild.channels.cache.get(guild.rulesChannelID).name}`
      : "None";

    const systemChannel = guild.systemChannelID
      ? `#${guild.channels.cache.get(guild.systemChannelID).name}`
      : "None";

    const textChannels = guild.channels.cache.filter(
      (channel) => channel.type == "text"
    ).size;

    const voiceChannels = guild.channels.cache.filter(
      (channel) => channel.type == "voice"
    ).size;

    const parentChannels = guild.channels.cache.filter(
      (channel) => channel.type == "category"
    ).size;

    const newsChannels = guild.channels.cache.filter(
      (channel) => channel.type == "news"
    ).size;

    let afkChannel = "";
    let afkTimeout = "";
    if (guild.afkChannelID) {
      afkChannel = `"${guild.channels.cache.get(guild.afkChannelID).name}"`;
      afkTimeout = ` - ${guild.afkTimeout}s Timeout`;
    } else if (!guild.afkChannelID) {
      afkChannel = "None";
    }

    const defaultMsgNotif = guild.defaultMessageNotifications
      .replace("ALL", "all messages")
      .replace("MENTIONS", "only @mentions");

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
      .setColor(embedcolor)
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
• \`${allRoles} Role(s) | ${allEmojis} Emoji(s) | ${allBoosts} Boost(s) | Tier ${serverTier}\`
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
    message.channel.send(serverInfoEmbed);
  }
};
