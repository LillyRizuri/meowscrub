const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { red, embedcolor } = require("../../assets/json/colors.json");

const notValidIDEmbed = new Discord.MessageEmbed()
  .setColor(red)
  .setDescription(
    "<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?"
  )
  .setFooter("you fool")
  .setTimestamp();

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
    let user;
    let member;
    let rolemap;

    if (message.mentions.users.first()) {
      // if the input was an user mention
      user = message.mentions.users.first();
      member = message.guild.members.cache.get(user.id);

      rolemap = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((r) => r)
        .join(" ");
      if (rolemap.length > 800) rolemap = "Too many roles to display.";
      if (!rolemap) rolemap = "No roles.";

      const infoEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Information for ${user.username}`,
          user.displayAvatarURL({
            dynamic: true,
          })
        )
        .setThumbnail(
          user.displayAvatarURL({
            dynamic: true,
          })
        )
        .setDescription(`[<@${user.id}>]`)
        .addFields(
          {
            name: "Member Details",
            value: `
• Nickname: \`${member.nickname || "None"}\`
• Roles [${member.roles.cache.size}]: ${rolemap}            
• Joined: \`${new Date(member.joinedTimestamp).toLocaleDateString(
              "en-US",
              dateTimeOptions
            )}\`
• Activity: \`${
              user.presence.activities[0]
                ? user.presence.activities[0].name
                : "None"
            }\`
                    `,
          },
          {
            name: "User Details",
            value: `
• ID: \`${user.id}\`
• Username: \`${user.tag}\`
• Created: \`${new Date(user.createdTimestamp).toLocaleDateString(
              "en-US",
              dateTimeOptions
            )}\`
• Status: \`${user.presence.status
              .replace("dnd", "Do Not Disturb")
              .toProperCase()}\`   
• Is Bot: \`${user.bot
              .toString()
              .replace("true", "Yes")
              .replace("false", "No")}\`
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
      if (!guild.member(args)) {
        // check if a person isn't in the guild it was ran on
        this.client.users
          .fetch(args)
          .then(async (user) => {
            member = message.guild.members.cache.get(user.id);

            const infoEmbed = new Discord.MessageEmbed()
              .setColor(embedcolor)
              .setAuthor(
                `Information for ${user.username}`,
                user.displayAvatarURL({
                  dynamic: true,
                })
              )
              .setThumbnail(
                user.displayAvatarURL({
                  dynamic: true,
                })
              )
              .setDescription(`[<@${user.id}>]`)
              .addFields({
                name: "User Details",
                value: `
• ID: \`${user.id}\`
• Username: \`${user.tag}\`
• Created: \`${new Date(user.createdTimestamp).toLocaleDateString(
                  "en-US",
                  dateTimeOptions
                )}\`
• Is Bot: \`${user.bot
                  .toString()
                  .replace("true", "Yes")
                  .replace("false", "No")}\`
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
          })
          .catch((err) => {
            message.reply(notValidIDEmbed);
          });
      } else {
        // it's the reverse
        try {
          user = message.guild.members.cache.get(args).user;
          member = message.guild.members.cache.get(user.id);

          rolemap = member.roles.cache
            .sort((a, b) => b.position - a.position)
            .map((r) => r)
            .join(" ");
          if (rolemap.length > 800) rolemap = "Too many roles to display.";
          if (!rolemap) rolemap = "No roles.";

          const infoEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(
              `Information for ${user.username}`,
              user.displayAvatarURL({
                dynamic: true,
              })
            )
            .setThumbnail(
              user.displayAvatarURL({
                dynamic: true,
              })
            )
            .setDescription(`[<@${user.id}>]`)
            .addFields(
              {
                name: "Member Details",
                value: `
• Nickname: \`${member.nickname || "None"}\`
• Roles [${member.roles.cache.size}]: ${rolemap}            
• Joined: \`${new Date(member.joinedTimestamp).toLocaleDateString(
                  "en-US",
                  dateTimeOptions
                )}\`
• Activity: \`${
                  user.presence.activities[0]
                    ? user.presence.activities[0].name
                    : "None"
                }\`
                    `,
              },
              {
                name: "User Details",
                value: `
• ID: \`${user.id}\`
• Username: \`${user.tag}\`
• Created: \`${new Date(user.createdTimestamp).toLocaleDateString(
                  "en-US",
                  dateTimeOptions
                )}\`
• Status: \`${user.presence.status
                  .replace("dnd", "Do Not Disturb")
                  .toProperCase()}\`   
• Is Bot: \`${user.bot
                  .toString()
                  .replace("true", "Yes")
                  .replace("false", "No")}\`
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
        } catch (err) {
          message.reply(notValidIDEmbed);
        }
      }
    } else {
      // if there's no argument, check for the user who ran the command
      user = message.author;
      member = guild.members.cache.get(user.id);

      rolemap = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((r) => r)
        .join(" ");
      if (rolemap.length > 800) rolemap = "Too many roles to display.";
      if (!rolemap) rolemap = "No roles.";

      const infoEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Information for ${user.username}`,
          user.displayAvatarURL({
            dynamic: true,
          })
        )
        .setThumbnail(
          user.displayAvatarURL({
            dynamic: true,
          })
        )
        .setDescription(`[<@${user.id}>]`)
        .addFields(
          {
            name: "Member Details",
            value: `
• Nickname: \`${member.nickname || "None"}\`
• Roles [${member.roles.cache.size}]: ${rolemap}            
• Joined: \`${new Date(member.joinedTimestamp).toLocaleDateString(
              "en-US",
              dateTimeOptions
            )}\`
• Activity: \`${
              user.presence.activities[0]
                ? user.presence.activities[0].name
                : "None"
            }\`
                    `,
          },
          {
            name: "User Details",
            value: `
• ID: \`${user.id}\`
• Username: \`${user.tag}\`
• Created: \`${new Date(user.createdTimestamp).toLocaleDateString(
              "en-US",
              dateTimeOptions
            )}\`
• Status: \`${user.presence.status
              .replace("dnd", "Do Not Disturb")
              .toProperCase()}\`   
• Is Bot: \`${user.bot
              .toString()
              .replace("true", "Yes")
              .replace("false", "No")}\`
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
