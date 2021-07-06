const Discord = require("discord.js");

const { green } = require("../assets/json/colors.json");

module.exports = {
  name: "ready",
  async execute(client) {
    client.distube
      .on("initQueue", (queue) => {
        queue.autoplay = false;
        queue.volume = 100;
      })
      .on("playSong", async (message, queue, song) => {
        const playingEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setThumbnail(song.thumbnail)
          .setDescription(
            `
<:scrubgreen:797476323316465676> **Now Playing:**
[${song.name}](${song.url}) - **${song.formattedDuration}**
  `
          )
          .setFooter(`Requested by: ${song.user.tag}`)
          .setTimestamp();
        message.channel.send(playingEmbed);
      })
      .on("addSong", (message, queue, song) => {
        message.channel.send(`
<:scrubgreen:797476323316465676> Added the following song to the queue:
\`${song.name} - ${song.formattedDuration}\`
        `);
      })
      .on("playList", (message, queue, playlist, song) => {
        const playlistEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setThumbnail(song.thumbnail)
          .setDescription(
            `
<:scrubgreen:797476323316465676> **Now Playing Playlist:**
[${playlist.name}](${playlist.url}) - **${playlist.songs.length} songs**

<:scrubgreen:797476323316465676> **Playing First:**
[${song.name}](${song.url}) - **${song.formattedDuration}**
          `
          )
          .setFooter(`Requested by: ${song.user.tag}`)
          .setTimestamp();
        message.channel.send(playlistEmbed);
      })
      .on("addList", (message, queue, playlist) => {
        message.channel.send(`
<:scrubgreen:797476323316465676> Added the following playlist to the queue:
\`${playlist.name} - ${playlist.songs.length} songs\`
        `);
      })
      .on("empty", (message) => {
        message.channel.send(
          "<:scrubnull:797476323533783050> **The VC I'm in is empty. Leaving the channel...**"
        );
      })
      .on("noRelated", (message) => {
        message.channel.send(
          "<:scrubnull:797476323533783050> **No related music can be found. Attempting to leave the VC...**"
        );
      })
      .on("finish", (message) => {
        message.channel.send(
          "<:scrubnull:797476323533783050> **The queue is now empty. Leaving the VC...**"
        );
      })
      .on("error", (message, err) => {
        message.channel.send(
          `
An unexpected error occurred whie executing the command.
You shouldn't receive an error like this. Please contact your nearest bot owner near you.
\`\`\`${err}\`\`\`
          `
        );
      });
  },
};
