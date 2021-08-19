const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["pause", "stop", "stahp"],
  memberName: "pause",
  group: "music",
  description: "Pause the music playback.",
  cooldown: 5,
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
        emoji.missingEmoji + " There's no queue for this server."
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    if (!queue.playing) {
      await client.distube.resume(message);
      await message.channel.send(
        emoji.successEmoji + " **Resumed the current track.**"
      );
    } else if (queue.playing) {
      await client.distube.pause(message);
      await message.channel.send(
        emoji.successEmoji + " **Paused the current track.**"
      );
    }
  },
};
