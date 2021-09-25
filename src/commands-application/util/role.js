const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Displays a specified role's information.")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The specified role")
        .setRequired(true)
    ),
  group: "util",
  examples: ["role @Member", "role 694239225226199070"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const role = interaction.options.getRole("role");

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

    interaction.reply({ embeds: [roleInfoEmbed] });
  },
};
