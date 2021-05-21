/* eslint-disable no-case-declarations */
const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const {
  green,
} = require("../../assets/json/colors.json");

module.exports = class ResumeTrackEmbed extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "resume",
      group: "music",
      memberName: "resume",
      description: "Resume the music playback.",
      clientPermissions: ["EMBED_LINKS"],
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
        this.client.distube.resume(message);
        const stoppedEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            "<:scrubgreen:797476323316465676> **Resumed the track.**"
          );
        message.channel.send(stoppedEmbed);
        break;
      case false:
        return message.reply(
          "<:scrubnull:797476323533783050> There's nothing playing."
        );
    }
  }
};
