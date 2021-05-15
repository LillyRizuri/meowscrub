const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const yes = "✔️";
const no = "❌";
const x = "```";
const s = "📛";
const c = "♨️";

const permissions = [
  "CREATE_INSTANT_INVITE",
  "KICK_MEMBERS",
  "BAN_MEMBERS",
  "ADMINISTRATOR",
  "MANAGE_CHANNELS",
  "MANAGE_GUILD",
  "ADD_REACTIONS",
  "VIEW_AUDIT_LOG",
  "PRIORITY_SPEAKER",
  "STREAM",
  "VIEW_CHANNEL",
  "SEND_MESSAGES",
  "SEND_TTS_MESSAGES",
  "MANAGE_MESSAGES",
  "EMBED_LINKS",
  "ATTACH_FILES",
  "READ_MESSAGE_HISTORY",
  "MENTION_EVERYONE",
  "USE_EXTERNAL_EMOJIS",
  "VIEW_GUILD_INSIGHTS",
  "CONNECT",
  "SPEAK",
  "MUTE_MEMBERS",
  "DEAFEN_MEMBERS",
  "MOVE_MEMBERS",
  "USE_VAD",
  "CHANGE_NICKNAME",
  "MANAGE_NICKNAMES",
  "MANAGE_ROLES",
  "MANAGE_WEBHOOKS",
  "MANAGE_EMOJIS",
];

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class UserPermissionsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "permissions",
      aliases: ["perms", "checkperms"],
      group: "utility",
      memberName: "permissions",
      description: "Shows your, or a specified user's permission.",
      argsType: "single",
      format: "[@user/userID]",
      examples: ["permissions @frockles"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  run(message, args) {
    let user;

    try {
      if (message.mentions.users.first()) {
        user = message.mentions.users.first();
      } else if (args) {
        user = message.guild.members.cache.get(args).user;
      } else {
        user = message.author;
      }

      const member = message.guild.members.cache.get(user.id);

      let description = `Server - ${s}\nCurrent Channel - ${c}\n\n${s} | ${c}\n`;

      const permListEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(`${user.tag}'s Permissions`);
      permissions.forEach((perm) => {
        description += `${member.permissions.has(perm) ? yes : no} | ${
          message.channel.permissionsFor(user.id).has(perm) ? yes : no
        } - ${perm.split("_").join(" ").toProperCase()}\n`;
      });
      permListEmbed.setDescription(x + description + x);
      message.channel.send(permListEmbed);
    } catch (err) {
      message.reply(
        "<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?"
      );
    }
  }
};
