const Commando = require("discord.js-commando");

module.exports = class AutoPlayMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "autoplay",
      group: "music",
      memberName: "autoplay",
      argsType: "single",
      description:
        "Enable/Disable the autoplay function by running the command.",
      details: "It's identical to the YouTube's autoplay function.",
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    let mode = null;
    const queue = await this.client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to commit the action."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> Must confirm that there's a queue first."
      );

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    mode = this.client.distube.toggleAutoplay(message);
    mode = mode ? "On" : "Off";
    message.channel.send(
      `<:scrubgreen:797476323316465676> Set autoplay mode to **${mode}**.`
    );
  }
};
