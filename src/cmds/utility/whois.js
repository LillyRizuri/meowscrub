const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const moment = require("moment");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class WhoIsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "whois",
      aliases: ["userinfo"],
      group: "utility",
      memberName: "whois",
      description: "Shows an user's information.",
      argsType: "single",
      format: "[@user/userID]",
      examples: ["whois @frockles"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    let target;
    try {
      if (!args) {
        target = message.author;
      } else {
        target =
          message.mentions.users.first() ||
          (await this.client.users.fetch(args));
      }
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?"
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
      return message.channel.send(infoEmbed);
    }

    const member = message.guild.members.cache.get(target.id);

    const nickname = member.nickname ? `"${member.nickname}"` : "None";

    const joinedTimestamp = new Date(member.joinedTimestamp).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );

    const userPresence = target.presence.activities[0]
      ? target.presence.activities[0].name
      : "None";

    let userPresenceState;
    if (target.presence.activities[0]) {
      if (target.presence.activities[0].state) {
        userPresenceState = `: ${target.presence.activities[0].state}`;
      } else if (!target.presence.activities[0].state) {
        userPresenceState = "";
      }
    }

    const userStatus = target.presence.status
      .replace("dnd", "Do Not Disturb")
      .toProperCase();

    let rolemap = member.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((r) => r)
      .join(" ")
      .replace("@everyone", "");
    if (rolemap.length > 800) rolemap = "`Too many roles to display.`";
    if (member.roles.cache.size - 1 === 0) rolemap = "`No roles to display.`";

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
    message.channel.send(infoEmbed);
  }
};
