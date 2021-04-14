const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class NowPlayingCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "nowplaying",
      aliases: ["np", "songinfo"],
      group: "music",
      memberName: "nowplaying",
      description:
        "Shows what music am I playing, and the current playhead location.",
      guildOnly: true,
    });
  }

  async run(message) {
    const queue = await this.client.distube.getQueue(message);

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to see what I am playing."
      );

    const playing = this.client.distube.isPlaying(message);
    if (playing === false)
      return message.reply(
        "<:scrubred:797476323169533963> There's nothing playing."
      );

    const npEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor("Now Playing")
      .setTitle(queue.songs[0].name)
      .setURL(queue.songs[0].url)
      .setThumbnail(queue.songs[0].thumbnail).setDescription(`
• **Requested by:** \`${queue.songs[0].user.tag}\`
• **Current Playhead:** \`${queue.formattedCurrentTime}/${queue.songs[0].formattedDuration}\`
            `);
    message.channel.send(npEmbed);
  }
};
