const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["loop", "repeat"],
  memberName: "loop",
  group: "music",
  description: "Repeat a single music or a queue.",
  details:
    "Running the command with no arguments and the command output will display the current music repeat config.",
  format: "[ song | queue | off ]",
  examples: ["loop song", "loop queue", "loop off"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let mode = null;
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Join an appropriate voice channel to configure that."
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

    const loopSetting = queue.repeatMode
      .toString()
      .replace("0", "Disabled")
      .replace("1", "Song")
      .replace("2", "Queue");

    if (!args)
      return message.reply(
        emoji.successEmoji + ` Current repeat configuration: **${loopSetting}**`
      );

    switch (args.toLowerCase()) {
      case "off":
        mode = 0;
        break;
      case "song":
        mode = 1;
        break;
      case "queue":
        mode = 2;
        break;
      default:
        return message.reply(
          emoji.denyEmoji + " THAT is not a valid value.\nEither it's `queue`, `song`, or turn `off`."
        );
    }

    mode = client.distube.setRepeatMode(message, mode);
    mode = mode ? (mode == 2 ? "Repeat Queue" : "Repeat Song") : "Off";
    message.channel.send(
      emoji.successEmoji + ` Set repeat mode to: **${mode}**`
    );
  },
};
