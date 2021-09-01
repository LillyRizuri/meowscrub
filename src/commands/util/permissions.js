const Discord = require("discord.js");

const modPerms = require("../../assets/json/mod-permissions.json");
const normalPerms = require("../../assets/json/normal-permissions.json");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["permissions", "perms", "checkperms"],
  memberName: "permissions",
  group: "util",
  description: "Shows your, or a specified user's permissions.",
  details:
    "This command checks permissions in the channel where the command was last ran. Leave the argument blank to display your permissions.",
  format: "[@user | userID]",
  examples: ["permissions @frockles", "permissions 693832549943869493"],
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

    const member = message.guild.members.cache.get(target.id);
    if (!member)
      return message.reply(
        emoji.denyEmoji + " The user you specified isn't in this server."
      );

    let modPermsDesc = "";
    let normalPermsDesc = "";

    modPerms.forEach((perm) => {
      modPermsDesc += `${
        message.channel.permissionsFor(target.id).has(perm) ? "✅" : "❌"
      } | ${perm
        .replace("MANAGE_EMOJIS_AND_STICKERS", "MANAGE_EMOJIS_&_STICKERS")
        .split("_")
        .join(" ")
        .toProperCase()}\n`;
    });

    normalPerms.forEach((perm) => {
      normalPermsDesc += `${
        message.channel.permissionsFor(target.id).has(perm) ? "✅" : "❌"
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

    message.channel.send({ embeds: [permListEmbed] });
  },
};
