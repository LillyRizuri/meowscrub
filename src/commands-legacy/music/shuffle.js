const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["shuffle"],
  memberName: "shuffle",
  group: "music",
  description: "Shuffle all music from the existing server queue.",
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

    await client.distube.shuffle(message);
    await message.channel.send(
      emoji.successEmoji + " **Shuffled the entire music queue.**"
    );
  },
};
