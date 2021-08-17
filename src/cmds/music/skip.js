const Commando = require("discord.js-commando");

module.exports = class SkipMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "skip",
      group: "music",
      memberName: "skip",
      description:
        "Attempt to skip a song if there's more than 1 song in the queue.",
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
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to do that action."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no music to play next."
      );

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    // eslint-disable-next-line no-empty
    if (queue.songs.length > 1 || queue.autoplay) {
    } else
      return message.reply(
        "<:scrubnull:797476323533783050> There's nowhere to skip."
      );

    this.client.distube.skip(message);
    message.channel.send("⏩ **Skipped!**");
  }
};
