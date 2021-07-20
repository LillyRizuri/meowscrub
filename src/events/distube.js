/* eslint-disable no-empty */
const Discord = require("discord.js");
const modules = require("../modules");

const { green, what } = require("../assets/json/colors.json");

module.exports = {
  name: "ready",
  async execute(client) {
    client.distube

      .on("initQueue", (queue) => {
        queue.autoplay = false;
        queue.volume = 100;
      })

      .on("playSong", async (message, queue, song) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) {
            client.playSongLog.delete();
          }
        } catch (err) {}
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
        client.playSongLog = await message.channel.send(playingEmbed);
      })

      .on("addSong", (message, queue, song) => {
        let estimatedTime = modules.formatDuration(
          queue.duration * 1000 - song.duration * 1000 - queue.currentTime
        );
        if (
          queue.songs[0].formattedDuration === "Live" ||
          queue.repeatMode === 1
        )
          estimatedTime = "Until you skip, that is";
        else if (
          queue.filter &&
          ["nightcore", "vaporwave", "reverse"].includes(queue.filter)
        )
          estimatedTime = "No accurate time due to your filter";
        const addSongEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setThumbnail(song.thumbnail)
          .setDescription(
            `
<:scrubnull:797476323533783050> **Added the following song to the queue:**
[${song.name}](${song.url}) - **${song.formattedDuration}**

Estimated Time Until Playing: **${estimatedTime}**
  `
          )
          .setFooter(`Requested by: ${song.user.tag}`)
          .setTimestamp();
        message.channel.send(addSongEmbed);
      })

      .on("playList", async (message, queue, playlist, song) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) {
            client.playSongLog.delete();
          }
        } catch (err) {}
        const playlistEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setThumbnail(song.thumbnail)
          .setDescription(
            `
<:scrubgreen:797476323316465676> **Now Playing Playlist:**
[${playlist.name}](${playlist.url}) - **${playlist.formattedDuration}** - **${playlist.songs.length} songs**

<:scrubgreen:797476323316465676> **Playing First:**
[${song.name}](${song.url}) - **${song.formattedDuration}**
          `
          )
          .setFooter(`Requested by: ${song.user.tag}`)
          .setTimestamp();
        client.playSongLog = await message.channel.send(playlistEmbed);
      })

      .on("addList", (message, queue, playlist) => {
        let estimatedTime = modules.formatDuration(
          queue.duration * 1000 - playlist.duration * 1000 - queue.currentTime
        );
        if (
          queue.songs[0].formattedDuration === "Live" ||
          queue.repeatMode === 1
        )
          estimatedTime = "Until you skip, that is";
        else if (
          queue.filter &&
          ["nightcore", "vaporwave", "reverse"].includes(queue.filter)
        )
          estimatedTime = "No accurate time due to your filter";
        const addListEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setThumbnail(playlist.thumbnail.url)
          .setDescription(
            `
<:scrubnull:797476323533783050> **Added the following playlist to the queue:**
[${playlist.name}](${playlist.url}) - **${playlist.formattedDuration}** - **${playlist.songs.length} songs**

Estimated Time Until Playing: **${estimatedTime}**
  `
          )
          .setFooter(`Requested by: ${playlist.user.tag}`)
          .setTimestamp();
        message.channel.send(addListEmbed);
      })

      .on("empty", (message) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) {
            client.playSongLog.delete();
          }
        } catch (err) {}
        message.channel.send(
          "<:scrubnull:797476323533783050> **The VC I'm in is empty. Leaving the channel...**"
        );
      })

      .on("noRelated", (message) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) {
            client.playSongLog.delete();
          }
        } catch (err) {}
        message.channel.send(
          "<:scrubnull:797476323533783050> **No related music can be found. Attempting to leave the VC...**"
        );
      })

      .on("finish", (message) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) {
            client.playSongLog.delete();
          }
        } catch (err) {}
        message.channel.send(
          "<:scrubnull:797476323533783050> **The queue is now empty. Leaving the VC...**"
        );
      })

      .on("error", (message, err) => {
        message.channel.send(
          `
An unexpected error occurred whie executing the command.
You shouldn't receive an error like this. Please contact your nearest bot owner near you.
\`\`\`\n${err}\n\`\`\`
          `
        );
      });
  },
};
