const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const {
  embedcolor,
  red,
  what,
  green,
} = require("../../assets/json/colors.json");

module.exports = class StopTrackEmbed extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "pause",
      aliases: ["stop", "stahp"],
      group: "music",
      memberName: "pause",
      description: "Pause the music playback.",
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

    if (paused === true)
    return message.reply(
      "<:scrubred:797476323169533963> It's already paused. Jeez."
    );

    switch (playing) {
      case true:
        this.client.distube.pause(message);
        const stoppedEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            "<:scrubgreen:797476323316465676> **Paused the track.**"
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
