const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["role", "roleinfo"],
  memberName: "role",
  group: "util",
  description: "Displays a specified role's information.",
  format: "[@role | roleName | roleID]",
  examples: [
    "role Member",
    "role @Member",
    "role 694239225226199070",
  ],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(emoji.missingEmoji + "There's no role to be found.");

    const role =
      message.mentions.roles.first() ||
      message.guild.roles.cache.find(
        (e) => e.name.toLowerCase().trim() == args.toLowerCase().trim()
      ) ||
      message.guild.roles.cache.find((e) => e.id === args);

    if (!role)
      return message.reply(
        emoji.denyEmoji + "Huh. I can't find the role you were looking for."
      );

    const roleInfoEmbed = new Discord.MessageEmbed()
      .setTitle(role.name)
      .setColor(role.color)
      .addFields({
        name: "Overview",
        value: `
• ID: \`${role.id}\`
• Color Hex: \`${role.hexColor}\`     
• Mentionable: \`${role.mentionable
          .toString()
          .replace("true", "Yes")
          .replace("false", "No")}\`    
• Hoisted: \`${role.hoist
          .toString()
          .replace("true", "Yes")
          .replace("false", "No")}\`  
• Position: \`${role.position}\`  
                `,
      });

    switch (role.members.size) {
      case 0:
        roleInfoEmbed.setDescription(`**No one** has the <@&${role.id}> role.`);
        break;
      case 1:
        roleInfoEmbed.setDescription(
          `**1** person has the <@&${role.id}> role.`
        );
        break;
      default:
        roleInfoEmbed.setDescription(
          `**${role.members.size}** people have the <@&${role.id}> role.`
        );
        break;
    }

    message.channel.send({ embeds: [roleInfoEmbed] });
  },
};
