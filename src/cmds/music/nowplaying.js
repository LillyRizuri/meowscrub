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
      clientPermissions: ["EMBED_LINKS"],
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

    if (!queue)
      return message.reply(
        "<:scrubred:797476323169533963> No queue found for this server."
      );

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    let currentPlayhead = `${queue.formattedCurrentTime}/${queue.songs[0].formattedDuration}`;

    if (queue.songs[0].isLive) currentPlayhead = "Live";
    else if (
      queue.filter &&
      ["nightcore", "vaporwave", "reverse"].includes(queue.filter)
    )
      currentPlayhead = "No accurate playhead due to your filter";

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
• **Current Playhead:** \`${currentPlayhead}\`
            `);
    message.channel.send(npEmbed);
  }
};
