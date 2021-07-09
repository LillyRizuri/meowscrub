const Commando = require("discord.js-commando");

module.exports = class JumpMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "jump",
      group: "music",
      memberName: "jump",
      description: "Jump from one music to another using a music queue's ID.",
      details:
        "List the queue to know which one to jump first. THIS ACTION WILL ALSO OVERWRITE ALL SONGS BEFORE YOUR CHOSEN MUSIC!",
      argsType: "single",
      format: "<musicID>",
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
        "<:scrubnull:797476323533783050> There's no queue to do that action."
      );

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no music queue's ID in your argument."
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
