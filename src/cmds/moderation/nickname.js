const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { red, green, what } = require("../../assets/json/colors.json");

module.exports = class SetNickCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "nickname",
      aliases: ["setnick", "nick"],
      group: "moderation",
      memberName: "nickname",
      description: "Change a member's nickname. Only use it when needed.",
      format: "<@user> <string>",
      examples: ["nick @frockles ManagedNIckname.mp4"],
      argsType: "multiple",
      clientPermissions: ["MANAGE_NICKNAMES"],
      userPermissions: ["MANAGE_NICKNAMES", "CHANGE_NICKNAME"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    const target = message.mentions.users.first();

    if (!target) {
      const noTargetEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> No user has to be found for nickname change."
        )
        .setFooter("h")
        .setTimestamp();
      message.reply(noTargetEmbed);
      return;
    }

    switch (target) {
      case message.author:
        const banningYourselfEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            "<:scrubred:797476323169533963> Change your nickname yourself. Don't rely on me."
          )
          .setFooter("e")
          .setTimestamp();
        message.reply(banningYourselfEmbed);
        return;
      case this.client.user:
        const banningItselfEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            "<:scrubred:797476323169533963> Did you ask me to change my nickname?"
          )
          .setFooter("you can't change mine in commands")
          .setTimestamp();
        message.reply(banningItselfEmbed);
        return;
    }

    const member = message.guild.members.cache.get(target.id);

    args.shift();
    const nickname = args.join(" ");

    if (!nickname) {
      const noNickNameEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> Another argument requires a nickname of some sort."
        )
        .setFooter("try again")
        .setTimestamp();
      message.reply(noNickNameEmbed);
      return;
    }

    try {
      await member.setNickname(
        nickname,
        `Operation done by ${message.author.tag}`
      );

      const nickchangeEmbed = new Discord.MessageEmbed()
        .setColor(green)
        .setDescription(
          `<:scrubgreen:797476323316465676> Successfully changed **${target.tag}**'s nickname to:\n"**${nickname}**".`
        )
        .setFooter("hope they aren't abusing unicode characters")
        .setTimestamp();
      message.reply(nickchangeEmbed);
    } catch (err) {
      const cannotChangeEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> Well, how am I supposed to change the nickname for that person?"
        )
        .setFooter("dumbass")
        .setTimestamp();
      message.reply(cannotChangeEmbed);
      return;
    }
  }
};
