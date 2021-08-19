const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["autoplay"],
  memberName: "autoplay",
  group: "music",
  description: "Enable/Disable autoplay by running the command.",
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message) => {
    let mode = null;
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

    mode = client.distube.toggleAutoplay(message);
    mode = mode ? "On" : "Off";
    message.channel.send(
      emoji.successEmoji + ` Set autoplay mode to **${mode}**.`
    );
  },
};
