const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { red, what, embedcolor } = require("../../assets/json/colors.json");

const invalidEmbed = new Discord.MessageEmbed()
  .setColor(red)
  .setDescription("<:scrubred:797476323169533963> THAT is not a valid role.")
  .setFooter("try again")
  .setTimestamp();

module.exports = class RoleInfoCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "roleinfo",
      aliases: ["role"],
      group: "utility",
      memberName: "roleinfo",
      description: "Shows a role's information and such.",
      argsType: "single",
      format: "[@role/roleID/roleName]",
      examples: [
        "roleinfo Member",
        "roleinfo @Member",
        "roleinfo 694239225226199070",
      ],
      guildOnly: true,
    });
  }

  run(message, args) {
    let role;
    if (message.mentions.roles.first()) {
      role = message.mentions.roles.first();
    } else if (isNaN(args) && !message.mentions.roles.first()) {
      role = message.guild.roles.cache.find(
        (e) => e.name.toLowerCase().trim() == args.toLowerCase().trim()
      );
      if (!role) return message.reply(invalidEmbed);
    } else if (args && !isNaN(args)) {
      role = message.guild.roles.cache.find((e) => e.id == args);
      if (!message.guild.roles.cache.has(args))
        return message.reply(invalidEmbed);
    }

    if (!role) {
      const noValueEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> Insert a role name or equivalent to continue."
        )
        .setFooter("wow what a lazy person")
        .setTimestamp();
      return message.reply(noValueEmbed);
    }

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

    message.channel.send(roleInfoEmbed);
  }
};
