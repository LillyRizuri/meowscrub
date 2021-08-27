const Discord = require("discord.js");
const moment = require("moment");

const perms = require("../../assets/json/mod-permissions.json");
const emoji = require("../../assets/json/tick-emoji.json");
const { embedcolor } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["whois", "userinfo"],
  memberName: "whois",
  group: "util",
  description: "Displays an user's information.",
  details: "Leave the argument blank to display information about you.",
  format: "[@user | userID]",
  examples: ["whois @frockles"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let target;
    try {
      if (!args) {
        target = message.author;
      } else {
        target =
          message.mentions.users.first() || (await client.users.fetch(args));
      }
    } catch (err) {
      return message.reply(
        emoji.denyEmoji +
          " What are you trying to do with that invalid user ID?"
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

    const createdAt = new Date(target.createdTimestamp).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    const avatar = target.displayAvatarURL({
      dynamic: true,
    });

    const isBot = target.bot
      .toString()
      .replace("true", "Yes")
      .replace("false", "No");

    if (!message.guild.members.resolve(target)) {
      const infoEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(`Information for ${target.username}`, avatar)
        .setThumbnail(avatar)
        .setDescription(`[${target}]`)
        .addFields({
          name: "User Details",
          value: `
• ID: \`${target.id}\`
• Username: \`${target.tag}\`
• Created: \`${createdAt} (${moment(target.createdTimestamp).fromNow()})\`
• Is Bot: \`${isBot}\`
`,
        })
        .setFooter(
          `Requested by ${message.author.tag}`,
          message.author.displayAvatarURL({
            dynamic: true,
          })
        )
        .setTimestamp();
      return message.channel.send({ embeds: [infoEmbed] });
    }

    const member = message.guild.members.cache.get(target.id);

    const nickname = member.nickname ? `"${member.nickname}"` : "None";

    const joinedTimestamp = new Date(member.joinedTimestamp).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    let userPresence = "";
    let userStatus = "";
    let userPresenceState = "";

    if (member.presence) {
      userStatus = member.presence.status
        .replace("dnd", "Do Not Disturb")
        .toProperCase();

      userPresence = member.presence.activities[0].name;

      if (member.presence.activities[0].state) {
        userPresenceState = `: ${member.presence.activities[0].state}`;
      } else if (!member.presence.activities[0].state) {
        userPresenceState = "";
      }
    } else {
      userStatus = "Offline";
      userPresence = "None";
    }

    let rolemap = member.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((r) => r)
      .join(" ")
      .replace("@everyone", "");
    if (rolemap.length > 800) rolemap = "`Too many roles to display.`";
    if (member.roles.cache.size - 1 === 0) rolemap = "`No roles to display.`";

    const permsArray = [];

    perms.forEach((perm) => {
      if (message.channel.permissionsFor(target.id).has(perm))
        permsArray.push(perm.split("_").join(" ").toProperCase());
    });

    const infoEmbed = new Discord.MessageEmbed()
      .setColor(member.displayHexColor)
      .setAuthor(`Information for ${target.username}`, avatar)
      .setThumbnail(avatar)
      .setDescription(`[${target}]`)
      .addFields(
        {
          name: "User Details",
          value: `
• ID: \`${target.id}\`
• Username: \`${target.tag}\`
• Created: \`${createdAt} (${moment(target.createdTimestamp).fromNow()})\` 
• Is Bot: \`${isBot}\`
`,
        },
        {
          name: "Member Details",
          value: `
• Nickname: \`${nickname}\`
• Roles [${member.roles.cache.size - 1}]: ${rolemap}        
• Joined: \`${joinedTimestamp} (${moment(member.joinedTimestamp).fromNow()})\`
• Status: \`${userStatus}\`  
• Top Activity: \`${userPresence}${userPresenceState}\`
                    `,
        }
      )
      .setFooter(
        `Requested by ${message.author.tag}`,
        message.author.displayAvatarURL({
          dynamic: true,
        })
      )
      .setTimestamp();

    if (permsArray.length > 0)
      infoEmbed.addField("Key Permissions", permsArray.join(", "));
    message.channel.send({ embeds: [infoEmbed] });
  },
};
