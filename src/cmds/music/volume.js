const Commando = require("discord.js-commando");

module.exports = class AdjustVolumeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "volume",
      aliases: ["vol", "v"],
      group: "music",
      memberName: "volume",
      argsType: "single",
      description: "Adjust the volume of the music player (in %)",
      details:
        "Leave the argument blank to show the current volume of the music player.",
      format: "[number]",
      examples: ["volume 80"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const queue = this.client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to loop the music."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no queue. Have at least one song before advancing."
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
        `<:scrubnull:797476323533783050> Current audio playback volume: **${queue.volume}%**`
      );

    const volume = Number(args);
    if (isNaN(volume) || !Number.isInteger(volume))
      return message.reply(
        "<:scrubred:797476323169533963> Percentage not valid. Try again."
      );

    if (volume < 1 || volume > 200)
      return message.reply(
        "<:scrubred:797476323169533963> The percentage you provided must be in-between 1 - 200%.\nMaking everyone's eardrum explode isn't a good idea."
      );

    this.client.distube.setVolume(message, volume);
    message.channel.send(
      `<:scrubgreen:797476323316465676> Adjusted the volume to **${volume}%**.`
    );
  }
};
