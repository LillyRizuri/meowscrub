const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["nickname", "setnick", "nick"],
  memberName: "nickname",
  group: "moderation",
  description: "Change a member's nickname. Don't abuse it.",
  format: "<@user | userID> <string>",
  examples: ["nick @frockles ManagedNIckname.mp4"],
  clientPermissions: ["MANAGE_NICKNAMES", "EMBED_LINKS"],
  userPermissions: ["MANAGE_NICKNAMES"],
  cooldown: 5,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " There's no user specified for nickname change."
      );

    let target;
    try {
      target =
        message.mentions.users.first() ||
        message.guild.members.cache.get(args[0]).user;
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + " What is this ID. Please explain now."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          emoji.denyEmoji + " Change your nickname yourself. Don't rely on me."
        );
      case client.user:
        return message.reply(
          emoji.denyEmoji +
            " Did you ask me to change my nickname? I won't let you change mine using commands."
        );
    }

    const member = message.guild.members.cache.get(target.id);
    if (
      message.member.roles.highest.position <= member.roles.highest.position &&
      message.guild.ownerId !== message.author.id
    )
      return message.reply(
        emoji.denyEmoji +
          ` You are not allowed to interact with **${target.tag}**.`
      );

    args.shift();
    const nickname = args.join(" ");

    if (!nickname) {
      return message.reply(
        emoji.missingEmoji +
          " Another argument requires a nickname of some sort."
      );
    }

    try {
      await member.setNickname(
        nickname,
        `Operation done by ${message.author.tag}`
      );

      message.reply(
        emoji.successEmoji +
          ` Successfully changed **${target.tag}**'s nickname to: "**${nickname}**".`
      );
    } catch (err) {
      message.reply(
        emoji.denyEmoji +
          " Well, how am I supposed to change the nickname for that person?"
      );
    }
  },
};
