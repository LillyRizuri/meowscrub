const Commando = require("discord.js-commando");

module.exports = class PlayAudioCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "obstacle",
      group: "music-library",
      memberName: "obstacle",
      description: "Type in quick! [15 Seconds]",
      throttling: {
        usages: 1,
        duration: 5,
      },
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
      connection.play("./src/assets/ogg/obstacle.ogg").on("finish", () => {
        voiceChannel.leave();
      });
    });

    await message.react("🔊");
    await message.reply("Opening the line...");
  }
};
