const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class ServerInfoCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "serverinfo",
      aliases: ["svinfo"],
      group: "utility",
      memberName: "serverinfo",
      description: "Shows some informations about this very guild.",
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    const dateTimeOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    };

    const createdAt = new Date(message.guild.createdAt).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    const serverOwner = await this.client.users.fetch(message.guild.ownerID);

    const allRoles = message.guild.roles.cache.size - 1;

    const allEmojis = message.guild.emojis.cache.size;

    const serverTier = message.guild.premiumTier;

    const memberCount =
      message.guild.memberCount -
      message.guild.members.cache.filter((m) => m.user.bot).size;

    const botCount = message.guild.members.cache.filter((m) => m.user.bot).size;

    const textChannels = message.guild.channels.cache.filter(
      (channel) => channel.type == "text"
    ).size;

    const voiceChannels = message.guild.channels.cache.filter(
      (channel) => channel.type == "voice"
    ).size;

    const parentChannels = message.guild.channels.cache.filter(
      (channel) => channel.type == "category"
    ).size;

    const newsChannels = message.guild.channels.cache.filter(
      (channel) => channel.type == "news"
    ).size;

    let afkChannel;
    try {
      afkChannel = `"${message.guild.afkChannel.name}"`;
    } catch (err) {
      afkChannel = "None";
    }

    const explicitContentFilter = message.guild.explicitContentFilter
      .replace("DISABLED", "Disabled")
      .replace("MEMBERS_WITHOUT_ROLES", "Members Without Roles")
      .replace("ALL_MEMBERS", "All Members");

    const verificationLevel = message.guild.verificationLevel
      .replace("NONE", "None")
      .replace("LOW", "Low")
      .replace("MEDIUM", "Medium")
      .replace("VERY_HIGH", "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻")
      .replace("HIGH", "(╯°□°）╯︵ ┻━┻");

    const communityFeatures =
      message.guild.features
        .join(", ")
        .toString()
        .replace("ANIMATED_ICON", "Animated Icon")
        .replace("BANNER", "Banner")
        .replace("COMMERCE", "Commerce")
        .replace("COMMUNITY", "Community")
        .replace("DISCOVERABLE", "Discoverable")
        .replace("FEATURABLE", "Featurable")
        .replace("INVITE_SPLASH", "Invite Splash")
        .replace("NEWS", "News")
        .replace("PARTNERED", "Partnered")
        .replace("RELAY_ENABLED", "Relay Enabled")
        .replace("VANITY_URL", "Vanity URL")
        .replace("VERIFIED", "Verified")
        .replace("VIP_REGIONS", "VIP Regions")
        .replace("WELCOME_SCREEN_ENABLED", "Welcome Screen Enabled")
        .replace("PREVIEW_ENABLED", "Preview Enabled")
        .replace(
          "MEMBER_VERIFICATION_GATE_ENABLED",
          "Member Verification Gate Enabled"
        ) || "No Community Features";

    const serverInfoEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(`Reports for: ${message.guild.name}`, message.guild.iconURL())
      .setThumbnail(message.guild.iconURL())
      .addFields(
        {
          name: "Overview",
          value: `
• Owner: \`${serverOwner.tag} | ID: ${serverOwner.id}\`
• Created At: \`${createdAt}\`       
• \`${memberCount} Member(s) | ${botCount} Bot(s)\`
• \`${allRoles} Role(s) | ${allEmojis} Emoji(s) | Tier ${serverTier}\`   
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
• AFK Voice Channel: \`${afkChannel}\`
• \`${textChannels} Text | ${voiceChannels} Voice | ${parentChannels} Category | ${newsChannels} News\`
          `,
        },
        {
          name: "Community Features",
          value: `\`• ${communityFeatures}\``,
        }
      )
      .setFooter(`GuildID: ${message.guild.id}`)
      .setTimestamp();
    message.channel.send(serverInfoEmbed);
  }
};
