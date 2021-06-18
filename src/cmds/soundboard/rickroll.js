const Commando = require("discord.js-commando");
const Discord = require("discord.js");

module.exports = class PlayAudioCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "rickroll",
      group: "soundboard",
      memberName: "rickroll",
      description: "Never gonna give you up",
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

    if (!voice.channelID)
      return message.reply(
        "<:scrubred:797476323169533963> Join an appropriate voice channel for shizzles. Now."
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

    const queue = await this.client.distube.getQueue(message);
    if (queue)
      return message.reply(
        "<:scrubred:797476323169533963> You shouldn't interfere with anyone's music seesion with my soundboard.\nEspecially if you plan to do something evil."
      );

    voice.channel.join().then((connection) => {
      connection.play("./src/assets/ogg/rickroll.ogg").on("finish", () => {
        voiceChannel.leave();
      });
    });

    await message.react("🔊");
    const RickrolldEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("get rickroll'd ya dunce")
      .setImage(
        "https://media.tenor.com/images/96abb4fe817afa8bb2d0ad9439b30f0b/tenor.gif"
      )
      .setTimestamp();
    await message.channel.send(RickrolldEmbed);
  }
};
