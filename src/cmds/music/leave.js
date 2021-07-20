const Commando = require("discord.js-commando");

module.exports = class StopMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "leave",
      aliases: ["dis", "disconnect", "fuckoff"],
      group: "music",
      memberName: "leave",
      description: "Stop playing music for you.",
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    const queue = await this.client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to stop me"
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no music to play."
      );

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    this.client.distube.stop(message);
    try {
      // eslint-disable-next-line no-empty
      if (!this.client.playSongLog) {
      } else if (this.client.playSongLog) {
        this.client.playSongLog.delete();
      }
    // eslint-disable-next-line no-empty
    } catch (err) {}
    message.channel.send(
      "<:scrubgreen:797476323316465676> **Stopped the track, and cleaned the queue.**"
    );
  }
};
