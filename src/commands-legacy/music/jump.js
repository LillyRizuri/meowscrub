const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["jump", "choose"],
  memberName: "jump",
  group: "music",
  description: "Jump from one music to another using a music queue's ID.",
  details:
    "List the queue to know which one to jump first. THIS ACTION WILL ALSO OVERWRITE ALL SONGS BEFORE YOUR CHOSEN MUSIC!",
  format: "<musicID>",
  examples: ["jump 3"],
  cooldown: 3,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const musicNumber = Number(args);
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Go to the same VC that I'm blasting music out to jump through music."
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
      await client.distube.jump(message, parseInt(musicNumber));
      await message.channel.send(
        `⏩ Jumped to a music with the song number: **${musicNumber}**.`
      );
    } catch (err) {
      message.reply(emoji.denyEmoji + " Completely invalid song number.");
    }
  },
};
