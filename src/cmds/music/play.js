const Commando = require("discord.js-commando");


module.exports = class PlayMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "play",
      aliases: ["p"],
      group: "music",
      memberName: "play",
      argsType: "single",
      description: "Very simple music command with no additional stuff whatsoever.",
      format: "<searchString>",
      examples: ["play very noise"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const music = args;
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to provide you music."
      );

    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!permissions.has("CONNECT"))
      return message.reply(
        "<:scrubred:797476323169533963> I don't think I can connect to the VC that you are in.\nPlease try again in another VC."
      );

    if (!permissions.has("SPEAK"))
      return message.reply(
        "<:scrubred:797476323169533963> I don't think that I can transmit music into the VC.\nPlease contact your nearest server administrator."
      );

    if (!music)
      return message.reply(
        "<:scrubnull:797476323533783050> I didn't see you searching for a specific music."
      );

    this.client.distube.play(message, music);
  }
};
