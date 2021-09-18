const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["volume", "vol", "v"],
  memberName: "volume",
  group: "music",
  description: "Adjust the volume control of the server queue in percentage.",
  details:
    "Leave the argument blank to show the current audio volume of the server queue.",
  format: "[number]",
  examples: ["volume 80"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Join an appropriate voice channel to configure that."
      );

    if (!queue)
      return message.reply(emoji.missingEmoji + " Where's the server queue?");

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    if (!args)
      return message.reply(
        emoji.successEmoji +
          ` Current audio playback volume: **${queue.volume}%**`
      );

    const volume = Number(args);
    if (isNaN(volume) || !Number.isInteger(volume))
      return message.reply(
        emoji.denyEmoji + " Percentage not valid. Try again."
      );

    if (volume < 1 || volume > 200)
      return message.reply(
        emoji.denyEmoji + " The percentage you provided must be in-between 1 - 200%. No higher than that."
      );

    await client.distube.setVolume(message, volume);
    await message.channel.send(
      emoji.successEmoji + ` Adjusted the audio volume to **${volume}%**.`
    );
  },
};
