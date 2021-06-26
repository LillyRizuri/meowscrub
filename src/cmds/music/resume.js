/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");

module.exports = class ResumeTrackEmbed extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "resume",
      group: "music",
      memberName: "resume",
      description: "Resume the music playback.",
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to do that action."
      );

    const paused = this.client.distube.isPaused(message);
    const playing = this.client.distube.isPlaying(message);

    if (playing === true)
      return message.reply(
        "<:scrubred:797476323169533963> What's the point if the speaker is already playing?"
      );

    switch (paused) {
      case true:
        // circumvention to a bug in discord.js running node.js v14.7
        this.client.distube.resume(message);
        this.client.distube.pause(message);
        this.client.distube.resume(message);
        message.channel.send(
          "<:scrubgreen:797476323316465676> **Resumed the track.**"
        );
        break;
      case false:
        return message.reply(
          "<:scrubnull:797476323533783050> There's nothing playing."
        );
    }
  }
};
