const emoji = require("../../assets/json/tick-emoji.json");

const notTimestampMsg = emoji.denyEmoji + " That is NOT a valid timestamp.";

module.exports = {
  aliases: ["seek", "playhead"],
  memberName: "seek",
  group: "music",
  description: "Move the playhead by providing a video timestamp.",
  format: "< hh:mm:ss | mm:ss | ss >",
  examples: ["seek 26", "seek 10:40", "seek 01:25:40"],
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
        emoji.missingEmoji + "A queue is required to do that action."
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    if (!seekValue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no video timestamp provided."
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

    if (isNaN(seconds) || !Number.isInteger(seconds))
      return message.reply(notTimestampMsg);

    await client.distube.seek(message, seconds);
    await message.channel.send(
      emoji.successEmoji + ` Moved the playhead to **${new Date(
        seconds * 1000
      )
        .toISOString()
        .substr(11, 8)}**.`
    );
  },
};
