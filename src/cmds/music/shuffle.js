const Commando = require("discord.js-commando");

module.exports = class ShuffleMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "shuffle",
      group: "music",
      memberName: "shuffle",
      description: "Shuffle all music from the existing queue.",
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
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to shuffle the entire queue."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no queue to even shuffle."
      );

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    this.client.distube.shuffle(message);
    message.channel.send(
      "<:scrubgreen:797476323316465676> **Shuffled the entire music queue.**"
    );
  }
};
