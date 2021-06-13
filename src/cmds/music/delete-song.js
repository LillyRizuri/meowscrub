const Commando = require("discord.js-commando");

module.exports = class DeleteSongCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "delete-song",
      aliases: ["remove-song", "del-song", "rm-song"],
      group: "music",
      memberName: "del-song",
      description:
        "Remove a song from the current music queue using a music queue ID.",
      details: "List the queue to know which one to remove first.",
      argsType: "single",
      format: "<musicNo>",
      examples: ["rm-song 2"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const queue = await this.client.distube.getQueue(message);
    const musicNumber = Number(args);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to do that action."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no queue to do that action."
      );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no music queue ID in your argument."
      );

    if (
      musicNumber <= 0 ||
      isNaN(musicNumber) ||
      !Number.isInteger(musicNumber)
    )
      return message.reply(
        "<:scrubred:797476323169533963> Right off the bat, I can see that the value isn't valid."
      );

    try {
      try {
        await message.channel.send(
          `
<:scrubgreen:797476323316465676> Removed this song which matches this music queue ID:
\`${musicNumber}. ${queue.songs[musicNumber].name} - ${queue.songs[musicNumber].formattedDuration}\`
\`Music requested by ${queue.songs[musicNumber].user.tag}\`
            `
        );
      } finally {
        await queue.songs.splice(musicNumber, 1);
      }
    } catch (err) {
      message.reply(
        "<:scrubred:797476323169533963> That music queue ID doesn't match with any songs found in the queue."
      );
    }
  }
};
