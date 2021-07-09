const Commando = require("discord.js-commando");

module.exports = class SetAudioFilterCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "filter",
      aliases: ["effect"],
      group: "music",
      memberName: "filter",
      argsType: "single",
      description: "Set a music filter for the music queue.",
      details:
        // eslint-disable-next-line quotes
        'All available filters can be found in this site: <https://distube.js.org/#/docs/DisTube/v2/typedef/Filter>. To turn off filters, type "off" instead of a normal audio filter value.',
      // eslint-disable-next-line quotes
      format: '[filterName/"off"]',
      guildOnly: true,
    });
  }

  async run(message, args) {
    const queue = await this.client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to configure filters."
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

    if (!args && queue.filter)
      return message.reply(
        `<:scrubnull:797476323533783050> Current audio filter: **${queue.filter}**`
      );
    else if (!args && !queue.filter)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no audio filter set in this server's queue.\nPlease set one by referring to this site: <https://distube.js.org/#/docs/DisTube/v2/typedef/Filter>"
      );

    if (
      (args.toLowerCase() === "off" && queue.filter) ||
      args.toLowerCase() === queue.filter
    ) {
      await this.client.distube.setFilter(message, queue.filter);
      return message.channel.send(
        "<:scrubgreen:797476323316465676> **Successfully turned off the audio filter.**"
      );
    }

    try {
      await this.client.distube.setFilter(message, args);
      await message.channel.send(
        `<:scrubgreen:797476323316465676> Successfully set the audio filter to **${args.toLowerCase()}**.`
      );
    } catch (err) {
      message.reply(
        "<:scrubred:797476323169533963> Sorry? That's NOT a valid audio filter.\nAll available audio filters can be seen here: <https://distube.js.org/#/docs/DisTube/v2/typedef/Filter>"
      );
    }
  }
};
