const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["disconnect", "dis", "leave", "fuckoff"],
  memberName: "leave",
  group: "music",
  description: "Stop the music playback and leave the voice channel.",
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
        emoji.missingEmoji + " There's no music playing. What's the point?"
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    if (client.cache.playSongLog[message.guild.id])
      try {
        await client.cache.playSongLog[message.guild.id].delete();
      // eslint-disable-next-line no-empty
      } catch (err) {}

    await client.distube.stop(message);
    await message.channel.send(
      emoji.successEmoji + " **Stopped the track, and cleaned the queue.**"
    );
  },
};
