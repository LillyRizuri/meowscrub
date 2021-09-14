const emoji = require("../../assets/json/tick-emoji.json");

const notTimestampMsg = emoji.denyEmoji + " That is NOT a valid timestamp.";

module.exports = {
  aliases: ["forward", "fw", "fwd"],
  memberName: "forward",
  group: "music",
  description: "Move the playhead by forwarding a certain amount of time.",
  format: "< hh:mm:ss | mm:ss | ss >",
  examples: ["forward 26", "forward 05:20", "forward 01:11:15"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const seekValue = args;
    const actualSeekValue = seekValue.split(":");
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji + " Join an appropriate voice channel right now."
      );

    if (!queue)
      return message.reply(
        emoji.missingEmoji + " A queue is required to do that action."
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    if (!seekValue)
      return message.reply(
        emoji.missingEmoji + " There's no timestamp provided to forward."
      );

    let seconds = 0;
    // Now converting the value into milliseconds
    if (seekValue.length < 3) {
      seconds = +seekValue;
      if (seekValue > 59) {
        return message.reply(notTimestampMsg);
      }
    } else if (seekValue.length < 6) {
      seconds = +actualSeekValue[0] * 60 + +actualSeekValue[1];
      if (+actualSeekValue[0] > 59 || +actualSeekValue[1] > 59) {
        return message.reply(notTimestampMsg);
      }
    } else {
      seconds =
        +actualSeekValue[0] * 3600 +
        +actualSeekValue[1] * 60 +
        +actualSeekValue[2];
      if (
        +actualSeekValue[0] > 23 ||
        +actualSeekValue[1] > 59 ||
        +actualSeekValue[2] > 59
      ) {
        return message.reply(notTimestampMsg);
      }
    }

    const seekLocation = Math.trunc(queue.currentTime + seconds);

    if (isNaN(seconds) || !Number.isInteger(seconds) || seconds < 0)
      return message.reply(notTimestampMsg);

    await client.distube.seek(message, seekLocation);
    await message.channel.send(
      emoji.successEmoji +
        ` Moved the playhead to **${new Date(seekLocation * 1000)
          .toISOString()
          .substr(11, 8)}**.`
    );
  },
};
