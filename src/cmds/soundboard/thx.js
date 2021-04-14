const Commando = require("discord.js-commando");

module.exports = class PlayAudioCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "thx",
      group: "soundboard",
      memberName: "thx",
      description: "It blares.",
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
      connection.play("./src/assets/ogg/thx.ogg").on("finish", () => {
        voiceChannel.leave();
      });
    });

    await message.react("🔊");
  }
};
