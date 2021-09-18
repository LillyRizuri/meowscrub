const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["delete-song", "remove-song", "del-song", "rm-song"],
  memberName: "delete-song",
  group: "music",
  description:
    "Remove a song from the current music queue using a music queue's ID",
  details: "List the queue to know which one to remove first.",
  format: "<musicID>",
  examples: ["delete-song 2"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const musicNumber = Number(args);
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Go to the same VC that I'm blasting music to do that action."
      );

    if (!queue)
      return message.reply(
        emoji.missingEmoji + " There's no queue to do that action."
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    if (!args)
      return message.reply(
        emoji.missingEmoji + " There's no music queue's ID in your argument."
      );

    if (
      musicNumber <= 0 ||
      isNaN(musicNumber) ||
      !Number.isInteger(musicNumber)
    )
      return message.reply(
        emoji.denyEmoji +
          " Right off the bat, I can see that the value isn't valid."
      );

    try {
      try {
        await message.channel.send(
          emoji.successEmoji +
            ` Removed this song which matches this music queue's ID:
\`\`\`
${musicNumber}. ${queue.songs[musicNumber].name} - ${queue.songs[musicNumber].formattedDuration}
Music requested by ${queue.songs[musicNumber].user.tag}
\`\`\`
              `
        );
      } finally {
        await queue.songs.splice(musicNumber, 1);
      }
    } catch (err) {
      message.reply(
        emoji.denyEmoji +
          " That ID doesn't match with any songs found in the queue."
      );
    }
  },
};
