const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const {
  embedcolor,
  red,
  what,
  green,
} = require("../../assets/json/colors.json");

module.exports = class ResumeTrackEmbed extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "resume",
      group: "music",
      memberName: "resume",
      description: "Resume the music playback.",
      guildOnly: true,
    });
  }

  run(message) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      const notInVCEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          `<:scrubnull:797476323533783050> Join an appropriate voice channel to do that action.`
        )
        .setFooter("now.")
        .setTimestamp();
      message.reply(notInVCEmbed);
      return;
    }

    const paused = this.client.distube.isPaused(message);
    const playing = this.client.distube.isPlaying(message);

    if (playing === true) {
      const alreadyPausedEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          `<:scrubred:797476323169533963> What's the point if the speaker is already playing.`
        )
        .setFooter("jeez")
        .setTimestamp();
      message.reply(alreadyPausedEmbed);
      return;
    }

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
        const notInVCEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setDescription(
            `<:scrubnull:797476323533783050> There's nothing playing.`
          )
          .setFooter("huh.")
          .setTimestamp();
        message.reply(notInVCEmbed);
        break;
    }
  }
};
