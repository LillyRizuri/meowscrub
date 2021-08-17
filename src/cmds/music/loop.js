const Commando = require("discord.js-commando");

module.exports = class LoopMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "loop",
      aliases: ["repeat"],
      group: "music",
      memberName: "loop",
      argsType: "single",
      description: "Loop your music or queue.",
      details:
        "There are 3 values to choose: `song`, `queue`, or turn it `off`.",
      format: "[value]",
      examples: ["loop song", "loop queue", "loop off"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const queue = await this.client.distube.getQueue(message);
    let mode = null;
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to configure that."
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

    const loopSetting = queue.repeatMode
      .toString()
      .replace("0", "Disabled")
      .replace("1", "Song")
      .replace("2", "Queue");

    if (!args)
      return message.reply(
        `<:scrubnull:797476323533783050> Current repeat configuration: **${loopSetting}**`
      );

    switch (args) {
      case "off":
        mode = 0;
        break;
      case "song":
        mode = 1;
        break;
      case "queue":
        mode = 2;
        break;
      default:
        return message.reply(
          "<:scrubred:797476323169533963> THAT is not a valid value.\nEither it's `queue`, `song`, or turn `off`."
        );
    }

    mode = this.client.distube.setRepeatMode(message, mode);
    mode = mode ? (mode == 2 ? "Repeat Queue" : "Repeat Song") : "Off";
    message.channel.send(
      `<:scrubgreen:797476323316465676> Set repeat configuration to: **${mode}**`
    );
  }
};
