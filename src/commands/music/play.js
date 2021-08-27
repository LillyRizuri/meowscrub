const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["play", "p"],
  memberName: "play",
  group: "music",
  description:
    "Very simple music command with the ability to play provided video/audio attachments.",
  format: "<searchString | videoAttachment | audioAttachment>",
  examples: ["play very noise"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    function isFileImage(file) {
      return file && file.contentType.split("/")[0] === "image";
    }

    if (message.attachments.first()) {
      const attachment = message.attachments.first();

      if (isFileImage(attachment))
        return message.reply(
          emoji.denyEmoji +
            " That's an IMAGE. I'm not going to put that in a queue."
        );
    }

    const music = message.attachments.first()
      ? message.attachments.first().url
      : args;

    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji + " Join an appropriate voice channel right now."
      );

    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!permissions.has("CONNECT"))
      return message.reply(
        emoji.denyEmoji +
          " I don't think I can connect to the VC that you are in.\nPlease try again in another VC."
      );

    if (!permissions.has("SPEAK"))
      return message.reply(
        emoji.denyEmoji +
          " I don't think that I can transmit music into the VC.\nPlease contact your nearest server administrator."
      );

    if (queue)
      if (message.guild.me.voice.channelId !== message.member.voice.channelId)
        return message.reply(
          emoji.denyEmoji +
            " You need to be in the same VC with me in order to continue."
        );

    if (!music)
      return message.reply(
        emoji.missingEmoji + " I didn't see you searching for a specific music."
      );

    if (music.length >= 1024)
      return message.reply(
        emoji.denyEmoji +
          " Your search query musn't be longer than/equal 1024 characters."
      );

    message.channel.send("🔍 **Searching and attempting...**");
    client.distube.play(message, music);
  },
};
