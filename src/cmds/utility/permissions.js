const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const modPerms = require("../../assets/json/mod-permissions.json");
const normalPerms = require("../../assets/json/normal-permissions.json");

module.exports = class UserPermissionsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "permissions",
      aliases: ["perms", "checkperms"],
      group: "utility",
      memberName: "permissions",
      description: "Shows your, or a specified user's permission.",
      argsType: "multiple",
      format: "<@user/userID> [--text]",
      examples: ["permissions @frockles"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> Please provide an user mention/user ID in order to continue."
      );

    let target;
    try {
      target =
        message.mentions.users.first() ||
        (await this.client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?"
      );
    }

    const member = message.guild.members.cache.get(target.id);

    let authorText = "";
    let modPermsDesc = "";
    let normalPermsDesc = "";

    if (args[1] && args[1].toLowerCase() === "--text") {
      authorText = `${target.tag}'s Current Text Channel Permissions`;
      modPerms.forEach((perm) => {
        modPermsDesc += `${
          message.channel.permissionsFor(target.id).has(perm) ? "✅" : "❌"
        } | ${perm.split("_").join(" ").toProperCase()}\n`;
      });

      normalPerms.forEach((perm) => {
        normalPermsDesc += `${
          message.channel.permissionsFor(target.id).has(perm) ? "✅" : "❌"
        } | ${perm.split("_").join(" ").toProperCase()}\n`;
      });
    } else {
      authorText = `${target.tag}'s Current Server Permissions`;
      modPerms.forEach((perm) => {
        modPermsDesc += `${member.permissions.has(perm) ? "✅" : "❌"} | ${perm
          .split("_")
          .join(" ")
          .toProperCase()}\n`;
      });

      normalPerms.forEach((perm) => {
        normalPermsDesc += `${
          member.permissions.has(perm) ? "✅" : "❌"
        } | ${perm.split("_").join(" ").toProperCase()}\n`;
      });
    }

    const permListEmbed = new Discord.MessageEmbed()
      .setColor(member.displayHexColor)
      .setAuthor(authorText, target.displayAvatarURL())
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
    message.channel.send(permListEmbed);
  }
};
