const Discord = require("discord.js");
const {
  joinVoiceChannel,
  createAudioResource,
  NoSubscriberBehavior,
  createAudioPlayer,
  AudioPlayerStatus,
} = require("@discordjs/voice");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["rickroll"],
  memberName: "rickroll",
  group: "soundboard",
  description: "Never gonna give you up-",
  guildOnly: true,
  callback: async (client, message) => {
    const { voice } = message.member;
    const voiceChannel = message.member.voice.channel;

    if (!voice.channelId)
      return message.reply(
        emoji.missingEmoji +
          " Join an appropriate voice channel for shizzles. Now."
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

    const queue = await client.distube.getQueue(message);
    if (queue)
      return message.reply(
        emoji.denyEmoji +
          " You shouldn't interfere with anyone's music seesion with my soundboard.\nEspecially if you plan to do something evil."
      );

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });

    const connection = joinVoiceChannel({
      channelId: message.member.voice.channel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const resource = createAudioResource("./src/assets/ogg/rickroll.ogg");
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await message.react("🔊");
    const RickrolldEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("get rickroll'd")
      .setImage(
        "https://media.tenor.com/images/96abb4fe817afa8bb2d0ad9439b30f0b/tenor.gif"
      )
      .setTimestamp();
    await message.channel.send({ embeds: [RickrolldEmbed] });
  },
};
