const Commando = require("discord.js-commando");
const Discord = require("discord.js");

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
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const guild = this.client.guilds.cache.get(message.guild.id);
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
      weekday: "long",
      year: "numeric",
      month: "long",
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

    if (!guild.members.resolve(target)) {
      const infoEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(`Information for ${target.username}`, avatar)
        .setThumbnail(avatar)
        .setDescription(`[<@${target.id}>]`)
        .addFields({
          name: "User Details",
          value: `
• ID: \`${target.id}\`
• Username: \`${target.tag}\`
• Created: \`${createdAt}\`
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

    const joinedTimestamp = new Date(member.joinedTimestamp).toLocaleDateString(
      "en-US",
      dateTimeOptions
    );
    const userPresence = target.presence.activities[0]
      ? target.presence.activities[0].name
      : "None";

    const userStatus = target.presence.status
      .replace("dnd", "Do Not Disturb")
      .toProperCase();

    let rolemap = member.roles.cache
      .sort((a, b) => b.position - a.position)
      .map((r) => r)
      .join(" ")
      .replace("@everyone", " ");
    if (rolemap.length > 800) rolemap = "`Too many roles to display.`";
    if (member.roles.cache.size - 1 === 0) rolemap = "`No roles to display.`";

    const infoEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(`Information for ${target.username}`, avatar)
      .setThumbnail(avatar)
      .setDescription(`[<@${target.id}>]`)
      .addFields(
        {
          name: "Member Details",
          value: `
• Nickname: \`${member.nickname || "None"}\`
• Roles [${member.roles.cache.size - 1}]: ${rolemap}        
• Joined: \`${joinedTimestamp}\`
• Activity: \`${userPresence}\`
                    `,
        },
        {
          name: "User Details",
          value: `
• ID: \`${target.id}\`
• Username: \`${target.tag}\`
• Created: \`${createdAt}\`
• Status: \`${userStatus}\`   
• Is Bot: \`${isBot}\`
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
