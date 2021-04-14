const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");

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

    if (!target)
      return message.reply(
        "<:scrubnull:797476323533783050> No user has to be found for nickname change."
      );

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Change your nickname yourself. Don't rely on me."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Did you ask me to change my nickname? I won't let you change mine using commands."
        );
    }

    const member = message.guild.members.cache.get(target.id);

    args.shift();
    const nickname = args.join(" ");

    if (!nickname) {
      return message.reply(
        "<:scrubnull:797476323533783050> Another argument requires a nickname of some sort."
      );
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
      message.reply(
        "<:scrubred:797476323169533963> Well, how am I supposed to change the nickname for that person?"
      );
    }
  }
};
