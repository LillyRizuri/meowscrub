const Commando = require("discord.js-commando");

module.exports = class SkipMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "skip",
      group: "music",
      memberName: "skip",
      description:
        "Attempt to skip a song if there's more than 1 song in the queue.",
      clientPermissions: ["CONNECT", "SPEAK"],
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

    this.client.distube.skip(message);
    message.channel.send("⏩ **Skipped!**");
  }
};
