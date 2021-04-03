const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { red, embedcolor } = require("../../assets/json/colors.json");

module.exports = class WhoIsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "whois",
      aliases: ["userinfo"],
      group: "utility",
      memberName: "whois",
      description: "Shows an user's information.",
      argsType: "single",
      format: "[@user]",
      examples: ["whois @frockles"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    // worst code ever
    let guild = this.client.guilds.cache.get(message.guild.id);

    const dateTimeOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    };

    let target;
    let member;
    let rolemap;
    var joinedTimestamp;
    let userPresence;
    var createdAt;
    let userStatus;
    let isBot;

    if (message.mentions.users.first()) {
      // if the input was an user mention
      target = message.mentions.users.first();
      member = message.guild.members.cache.get(target.id);

      joinedTimestamp = new Date(member.joinedTimestamp).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      createdAt = new Date(target.createdTimestamp).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      userPresence = target.presence.activities[0]
        ? target.presence.activities[0].name
        : "None";

      userStatus = target.presence.status
        .replace("dnd", "Do Not Disturb")
        .toProperCase();

      isBot = target.bot
        .toString()
        .replace("true", "Yes")
        .replace("false", "No");

      rolemap = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((r) => r)
        .join(" ")
        .replace("@everyone", " ");
      if (rolemap.length > 800) rolemap = "`Too many roles to display.`";
      if (member.roles.cache.size - 1 === 0) rolemap = "`No roles to display.`";

      const infoEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Information for ${target.username}`,
          target.displayAvatarURL({
            dynamic: true,
          })
        )
        .setThumbnail(
          target.displayAvatarURL({
            dynamic: true,
          })
        )
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
    } else if (args[0]) {
      // if the input was a string
      this.client.users
        .fetch(args)
        .then((target) => {
          createdAt = new Date(target.createdTimestamp).toLocaleDateString(
            "en-US",
            dateTimeOptions
          );

          isBot = target.bot
            .toString()
            .replace("true", "Yes")
            .replace("false", "No");

          if (!guild.member(args)) {
            // check if a person isn't in the guild it was ran on

            const infoEmbed = new Discord.MessageEmbed()
              .setColor(embedcolor)
              .setAuthor(
                `Information for ${target.username}`,
                target.displayAvatarURL({
                  dynamic: true,
                })
              )
              .setThumbnail(
                target.displayAvatarURL({
                  dynamic: true,
                })
              )
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
            message.channel.send(infoEmbed);
          } else {
            // it's the reverse
            member = message.guild.members.cache.get(target.id);

            joinedTimestamp = new Date(
              member.joinedTimestamp
            ).toLocaleDateString("en-US", dateTimeOptions);

            userPresence = target.presence.activities[0]
              ? target.presence.activities[0].name
              : "None";

            userStatus = target.presence.status
              .replace("dnd", "Do Not Disturb")
              .toProperCase();

            rolemap = member.roles.cache
              .sort((a, b) => b.position - a.position)
              .map((r) => r)
              .join(" ")
              .replace("@everyone", " ");
            if (rolemap.length > 800) rolemap = "`Too many roles to display.`";
            if (member.roles.cache.size - 1 === 0)
              rolemap = "`No roles to display.`";

            const infoEmbed = new Discord.MessageEmbed()
              .setColor(embedcolor)
              .setAuthor(
                `Information for ${target.username}`,
                target.displayAvatarURL({
                  dynamic: true,
                })
              )
              .setThumbnail(
                target.displayAvatarURL({
                  dynamic: true,
                })
              )
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
        })
        .catch((err) => {
          return message.reply(
            "<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?"
          );
        });
    } else {
      // if there's no argument, check for the user who ran the command
      target = message.author;
      member = guild.members.cache.get(target.id);

      joinedTimestamp = new Date(member.joinedTimestamp).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      createdAt = new Date(target.createdTimestamp).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      userPresence = target.presence.activities[0]
        ? target.presence.activities[0].name
        : "None";

      userStatus = target.presence.status
        .replace("dnd", "Do Not Disturb")
        .toProperCase();

      isBot = target.bot
        .toString()
        .replace("true", "Yes")
        .replace("false", "No");

      rolemap = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((r) => r)
        .join(" ")
        .replace("@everyone", " ");
      if (rolemap.length > 800) rolemap = "`Too many roles to display.`";
      if (member.roles.cache.size - 1 === 0) rolemap = "`No roles to display.`";

      const infoEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Information for ${target.username}`,
          target.displayAvatarURL({
            dynamic: true,
          })
        )
        .setThumbnail(
          target.displayAvatarURL({
            dynamic: true,
          })
        )
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
  }
};
