const Commando = require("discord.js-commando");
const path = require("path");

module.exports = class PlayAudioCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "objection",
      group: "soundboard",
      memberName: "objection",
      description: "OBJECTION!",
      guildOnly: true,
    });
  }

  async run(message) {
    const { voice } = message.member;
    const voiceChannel = message.member.voice.channel;

    if (!voice.channelID) {
      message.reply(
        "<:scrubred:797476323169533963> Join an appropriate voice channel for shizzles. Now."
      );
      return;
    }

    voice.channel.join().then((connection) => {
      connection.play("./src/assets/ogg/objection.ogg").on("finish", () => {
        voiceChannel.leave();
      });
    });

    await message.react(`🔊`);
  }
};
