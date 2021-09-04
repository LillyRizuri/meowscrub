const Discord = require("discord.js");
const moment = require("moment");

const modPerms = require("../../assets/json/mod-permissions.json");
const { embedcolor } = require("../../assets/json/colors.json");

module.exports = {
  data: {
    name: "User Info",
    type: 2,
  },
  memberName: "test",
  group: "context",
  callback: async (client, interaction) => {
    const target = interaction.options.getUser("user");

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

    if (!interaction.guild || !interaction.guild.members.resolve(target)) {
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
          `Requested by ${interaction.user.tag}`,
          interaction.user.displayAvatarURL({
            dynamic: true,
          })
        )
        .setTimestamp();
      return interaction.reply({ embeds: [infoEmbed] });
    }

    const member = interaction.guild.members.cache.get(target.id);

    const nickname = member.nickname ? `"${member.nickname}"` : "None";

    const joinedTimestamp = new Date(member.joinedTimestamp).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    let userPresence = "";
    let userStatus = "";
    let userPresenceState = "";

    if (member.presence.activities[0]) {
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

    modPerms.forEach((perm) => {
      if (interaction.channel.permissionsFor(target.id).has(perm))
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
        `Requested by ${interaction.user.tag}`,
        interaction.user.displayAvatarURL({
          dynamic: true,
        })
      )
      .setTimestamp();

    if (permsArray.length > 0)
      infoEmbed.addField("Key Permissions", permsArray.join(", "));
    interaction.reply({ embeds: [infoEmbed] });
  },
};
