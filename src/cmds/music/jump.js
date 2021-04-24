const Commando = require("discord.js-commando");


module.exports = class JumpMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "jump",
      group: "music",
      memberName: "jump",
      description:
        "Jump from one music to another. List the queue to know which one to jump first.",
      argsType: "single",
      format: "<musicNo>",
      examples: ["jump 3"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const queue = await this.client.distube.getQueue(message);
    const musicNumber = Number(args);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to jump through."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no queue to commit that action."
      );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no music no. in your argument."
      );

    if (
      musicNumber <= 0 ||
      isNaN(musicNumber) ||
      !Number.isInteger(musicNumber)
    )
      return message.reply(
        "<:scrubred:797476323169533963> Right off the bat, I can see that the value isn't valid."
      );

    try {
      this.client.distube.jump(message, parseInt(musicNumber));
      message.channel.send(
        `⏩ Jumped to a music with the song number: **${musicNumber}**.`
      );
    } catch (err) {
      message.reply(
        "<:scrubred:797476323169533963> Completely invalid song number."
      );
    }
  }
};
