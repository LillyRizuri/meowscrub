const Commando = require("discord.js-commando");

module.exports = class SayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "say",
      aliases: ["s"],
      group: "utility",
      memberName: "say",
      description: "Make me say something to a channel.",
      argsType: "multiple",
      format: "<#channel/channelID> <content>",
      examples: ["say #test hello"],
      userPermissions: ["MANAGE_MESSAGES"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  run(message, args) {
    const textChannel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args[0]);
    const content = args.slice(1).join(" ");

    if (!args[0])
    return message.reply(
      "<:scrubnull:797476323533783050> Provide a channel before advancing."
    );

    if (!args[1])
    return message.reply(
      "<:scrubnull:797476323533783050> Message content to send, where did it go?"
    );

    try {
      textChannel
        .send(`${content}\n- **${message.author.tag}**`)
        .then(message.react("✅"));
    } catch (err) {
      message.reply(
        "<:scrubred:797476323169533963> Is that an invalid channel ID?\nBecause I couldn't find the channel that you were looking for."
      );
    }
  }
};
