const DisTube = require("distube");
const Discord = require("discord.js");

const { green } = require("../assets/json/colors.json");

module.exports = {
  name: "ready",
  async execute(client) {
    // support for music playback
    client.distube = new DisTube(client, {
      searchSongs: false,
      emitNewSongOnly: true,
      leaveOnFinish: true,
      youtubeDL: true,
      updateYouTubeDL: true,
      youtubeCookie: process.env.YTCOOKIE,
    });
    /* To get your YouTube Cookie:
    / - Log in using your dummy channel (HIGHLY recommended because autoplay)
    / - Navigate to YouTube in a web browser
    / - Open up Developer Tools (opt+cmd+j on mac, ctrl+shift+j on windows)
    / - Go to the Network Tab
    / - Click on `sw.js_data` when it appears
    / - Scroll down to "Request Headers"
    / - Find the "cookie" header and copy its entire contents
    */
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
        const errorEmbed = new Discord.MessageEmbed()
          .setColor("#ff0000")
          .setAuthor("An error occurred while running the command:")
          .setDescription(`\`\`\`${err}\`\`\``)
          .setFooter(
            "You shouldn't receive an error like this. Please contact a bot owner near you."
          );
        message.channel.send(errorEmbed);
      });
  },
};
