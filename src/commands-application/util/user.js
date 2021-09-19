const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fetch = require("node-fetch");
const moment = require("moment");

const modPerms = require("../../assets/json/mod-permissions.json");
const normalPerms = require("../../assets/json/normal-permissions.json");
const emoji = require("../../assets/json/tick-emoji.json");
const { embedcolor } = require("../../assets/json/colors.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Check info for a targeted user.")
    .addSubcommand((command) =>
      command
        .setName("avatar")
        .setDescription("Return your/someone else's avatar.")
        .addUserOption((option) =>
          option.setName("user").setDescription("An user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName("banner")
        .setDescription("Return your/someone else's banner.")
        .addUserOption((option) =>
          option.setName("user").setDescription("An user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName("permissions")
        .setDescription("Shows your, or a specified user's permissions.")
        .addUserOption((option) =>
          option.setName("user").setDescription("An user")
        )
    )
    .addSubcommand((command) =>
      command
        .setName("info")
        .setDescription("Displays an user's information.")
        .addUserOption((option) =>
          option.setName("user").setDescription("An user")
        )
    ),
  group: "util",
  details: "Leave the `user` argument blank to fetch your user info.",
  examples: [
    "user avatar @frockles",
    "user banner @frockles",
    "user permissions @frockles",
    "user info @frockles",
  ],
  guildOnly: true,
  callback: async (client, interaction) => {
    const target = interaction.options.getUser("user")
      ? interaction.options.getUser("user")
      : interaction.user;

    switch (interaction.options.getSubcommand()) {
      case "avatar": {
        const avatar = target.displayAvatarURL({
          format: "png",
          size: 4096,
          dynamic: true,
        });

        const avatarEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor(`${target.tag}'s Profile Picture`)
          .setImage(avatar)
          .setFooter(
            `Requested by ${interaction.user.tag}`,
            interaction.user.displayAvatarURL({ dynamic: true })
          );

        interaction.reply({ embeds: [avatarEmbed] });
        break;
      }
      case "banner": {
        await interaction.deferReply();
        let receive = "";
        let banner =
          "https://cdn.discordapp.com/attachments/829722741288337428/834016013678673950/banner_invisible.gif";

        const res = await fetch(
          `https://discord.com/api/v8/users/${target.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bot ${process.env.TOKEN}`,
            },
          }
        );

        if (res.status !== 404) {
          const json = await res.json();
          receive = json["banner"];
        }

        if (receive) {
          const res2 = await fetch(
            `https://cdn.discordapp.com/banners/${target.id}/${receive}.gif`,
            {
              method: "GET",
              headers: {
                Authorization: `Bot ${process.env.TOKEN}`,
              },
            }
          );

          banner = `https://cdn.discordapp.com/banners/${target.id}/${receive}.gif?size=4096`;
          if (res2.status === 415)
            banner = `https://cdn.discordapp.com/banners/${target.id}/${receive}.png?size=4096`;
        } else
          return interaction.editReply({
            content:
              emoji.denyEmoji + " Couldn't find any profile banner set up!",
            ephemeral: true,
          });

        const bannerEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor(`${target.tag}'s Profile Banner`)
          .setImage(banner)
          .setFooter(
            `Requested by ${interaction.user.tag}`,
            interaction.user.displayAvatarURL({ dynamic: true })
          );

        await interaction.editReply({ embeds: [bannerEmbed] });
        break;
      }
      case "permissions": {
        const member = interaction.guild.members.cache.get(target.id);
        if (!member)
          return interaction.reply({
            content:
              emoji.denyEmoji + " The user you specified isn't in this server.",
            ephemeral: true,
          });

        let modPermsDesc = "";
        let normalPermsDesc = "";

        modPerms.forEach((perm) => {
          modPermsDesc += `${
            interaction.channel.permissionsFor(target.id).has(perm)
              ? "✅"
              : "❌"
          } | ${perm
            .replace("MANAGE_EMOJIS_AND_STICKERS", "MANAGE_EMOJIS_&_STICKERS")
            .split("_")
            .join(" ")
            .toProperCase()}\n`;
        });

        normalPerms.forEach((perm) => {
          normalPermsDesc += `${
            interaction.channel.permissionsFor(target.id).has(perm)
              ? "✅"
              : "❌"
          } | ${perm
            .replace("USE_APPLICATION_COMMANDS", "USE_SLASH_COMMANDS")
            .split("_")
            .join(" ")
            .toProperCase()}\n`;
        });

        const permListEmbed = new Discord.MessageEmbed()
          .setColor(member.displayHexColor)
          .setAuthor(
            `${target.tag}'s Current Text Channel Permissions`,
            target.displayAvatarURL()
          )
          .addFields(
            {
              name: "Moderation",
              value: `\`\`\`\n${modPermsDesc}\n\`\`\``,
              inline: true,
            },
            {
              name: "Texting",
              value: `\`\`\`\n${normalPermsDesc}\n\`\`\``,
              inline: true,
            }
          );

        interaction.reply({ embeds: [permListEmbed] });
        break;
      }
      case "info": {
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

        const joinedTimestamp = new Date(
          member.joinedTimestamp
        ).toLocaleDateString("en-US", dateTimeOptions);

        let userPresence = "";
        let userStatus = "";
        let userPresenceState = "";

        if (member.presence) {
          userStatus = member.presence.status
            .replace("dnd", "Do Not Disturb")
            .toProperCase();
        } else {
          userStatus = "Offline";
        }

        if (member.presence && member.presence.activities.length > 0) {
          userPresence = member.presence.activities[0].name;

          if (member.presence.activities[0].state) {
            userPresenceState = `: ${member.presence.activities[0].state}`;
          } else if (!member.presence.activities[0].state) {
            userPresenceState = "";
          }
        } else {
          userPresence = "None";
        }

        let rolemap = member.roles.cache
          .sort((a, b) => b.position - a.position)
          .map((r) => r)
          .join(" ")
          .replace("@everyone", "");
        if (rolemap.length > 800) rolemap = "`Too many roles to display.`";
        if (member.roles.cache.size - 1 === 0)
          rolemap = "`No roles to display.`";

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
      }
    }
  },
};
