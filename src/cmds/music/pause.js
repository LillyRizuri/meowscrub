/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");

module.exports = class StopTrackEmbed extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "pause",
      aliases: ["stop", "stahp"],
      group: "music",
      memberName: "pause",
      description: "Pause the music playback.",
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
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to do that action."
      );

    if (!queue)
      return message.reply(
        "<:scrubred:797476323169533963> No queue found for this server."
      );

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    const paused = this.client.distube.isPaused(message);
    const playing = this.client.distube.isPlaying(message);

    if (paused === true)
      return message.reply(
        "<:scrubred:797476323169533963> It's already paused. Jeez."
      );

    switch (playing) {
      case true:
        this.client.distube.pause(message);
        message.channel.send(
          "<:scrubgreen:797476323316465676> **Paused the track.**"
        );
        break;
      case false:
        return message.reply(
          "<:scrubnull:797476323533783050> There's nothing playing."
        );
    }
  }
};
