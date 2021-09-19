const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["skip"],
  memberName: "skip",
  group: "music",
  description:
    "Skip a song if there's more than 1 song in the queue, or the queue has autoplay enabled.",
  cooldown: 3,
  guildOnly: true,
  callback: async (client, message) => {
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Join an appropriate voice channel to commit the action."
      );

    if (!queue)
      return message.reply(
        emoji.missingEmoji + " Must confirm that there's a queue first."
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    // eslint-disable-next-line no-empty
    if (queue.songs.length > 1 || queue.autoplay) {
    } else return message.reply(emoji.denyEmoji + " There's nowhere to skip.");

    await client.distube.skip(message);
    await message.channel.send("⏩ **Skipped!**");
  },
};
