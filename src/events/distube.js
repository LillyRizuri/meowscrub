const DisTube = require("distube");
const Discord = require("discord.js");

const { green, what } = require("../assets/json/colors.json");

module.exports = {
  name: "ready",
  async execute(client) {
    // support for music playback
    client.distube = new DisTube(client, {
      searchSongs: false,
      emitNewSongOnly: true,
      leaveOnFinish: true,
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
        const playingEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setThumbnail(song.thumbnail)
          .setDescription(
            `
<:scrubgreen:797476323316465676> **Added to the queue.**
[${song.name}](${song.url}) - **${song.formattedDuration}**
  `
          )
          .setFooter(`Added by: ${song.user.tag}`)
          .setTimestamp();
        message.channel.send(playingEmbed);
      })
      .on("empty", (message) => {
        const emptyChannelEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setDescription(
            "<:scrubnull:797476323533783050> **VC Empty. Leaving the channel...**"
          );
        message.channel.send(emptyChannelEmbed);
      })
      .on("noRelated", (message) => {
        const noRelatedMusicEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setDescription(
            "<:scrubnull:797476323533783050> **No related music can be found. Leaving the VC...**"
          );
        message.channel.send(noRelatedMusicEmbed);
      })
      .on("finish", (message) => {
        const endQueueEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setDescription(
            "<:scrubnull:797476323533783050> **No more songs in queue. Leaving...**"
          );
        message.channel.send(endQueueEmbed);
      })
      .on("error", (message, err) => {
        const errorEmbed = new Discord.MessageEmbed()
          .setColor("#ff0000")
          .setTitle("(Un)expected Error Occurred.")
          .setDescription(`\`\`\`${err}\`\`\``);
        message.channel.send(errorEmbed);
      });
  },
};
