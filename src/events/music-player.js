/* eslint-disable no-empty */
const Discord = require("discord.js");
const util = require("../util/util");
const { getAudioDurationInSeconds } = require("get-audio-duration");

const { green, what } = require("../assets/json/colors.json");

module.exports = {
  name: "ready",
  async execute(client) {
    client.playSongLog;
    client.distube

      .on("initQueue", (queue) => {
        queue.autoplay = false;
        queue.volume = 100;
      })

      .on("playSong", async (queue, song) => {
        if (song.duration === 0)
          try {
            song.duration = await getAudioDurationInSeconds(song.url);
            song.formattedDuration = util.formatDuration(
              song.duration * 1000
            );
          } catch (err) {}

        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) await client.playSongLog.delete();
        } catch (err) {}

        song.name = decodeURIComponent(song.name);

        const playingEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setThumbnail(song.thumbnail)
          .setFooter(`Requested by: ${song.user.tag}`)
          .setTimestamp();
        if (song.playlist) {
          song.playlist.name = decodeURIComponent(song.playlist.name);
          playingEmbed.setDescription(
            `
<:scrubgreen:797476323316465676> **Now Playing Playlist:**
[${song.playlist.name}](${song.playlist.url}) - **${song.playlist.formattedDuration}** - **${song.playlist.songs.length} songs**

<:scrubgreen:797476323316465676> **Playing First:**
[${song.name}](${song.url}) - **${song.formattedDuration}**
          `
          );
        } else {
          playingEmbed.setDescription(
            `
<:scrubgreen:797476323316465676> **Now Playing:**
[${song.name}](${song.url}) - **${song.formattedDuration}**
  `
          );
        }
        client.playSongLog = await queue.textChannel.send({
          embeds: [playingEmbed],
        });
      })

      .on("addSong", async (queue, song) => {
        if (queue.searched) return delete queue.searched;
        if (song.duration === 0)
          try {
            song.duration = await getAudioDurationInSeconds(song.url);
            song.formattedDuration = util.formatDuration(
              song.duration * 1000
            );
          } catch (err) {}

        let estimatedTime = util.formatDuration(
          queue.duration * 1000 -
            song.duration * 1000 -
            queue.currentTime * 1000
        );
        if (
          queue.songs[0].formattedDuration === "Live" ||
          queue.repeatMode === 1
        )
          estimatedTime = "Until you skip, that is";
        else if (
          queue.filters &&
          ["nightcore", "vaporwave", "reverse"].some((element) =>
            queue.filters.includes(element)
          )
        )
          estimatedTime = "No accurate time due to your filter";

        song.name = decodeURIComponent(song.name);

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
        queue.textChannel.send({ embeds: [addSongEmbed] });
      })

      .on("addList", (queue, playlist) => {
        let estimatedTime = util.formatDuration(
          queue.duration * 1000 -
            playlist.duration * 1000 -
            queue.currentTime * 1000
        );
        if (
          queue.songs[0].formattedDuration === "Live" ||
          queue.repeatMode === 1
        )
          estimatedTime = "Until you skip, that is";
        else if (
          queue.filters &&
          ["nightcore", "vaporwave", "reverse"].some((element) =>
            queue.filters.includes(element)
          )
        )
          estimatedTime = "No accurate time due to your filter";

        playlist.name = decodeURIComponent(playlist.name);

        const addListEmbed = new Discord.MessageEmbed()
          .setColor(what)
          .setThumbnail(playlist.thumbnail)
          .setDescription(
            `
<:scrubnull:797476323533783050> **Added the following playlist to the queue:**
[${playlist.name}](${playlist.url}) - **${playlist.formattedDuration}** - **${playlist.songs.length} songs**

Estimated Time Until Playing: **${estimatedTime}**
  `
          )
          .setFooter(`Requested by: ${playlist.user.tag}`)
          .setTimestamp();
        queue.textChannel.send({ embeds: [addListEmbed] });
      })

      .on("empty", async (queue) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) await client.playSongLog.delete();
        } catch (err) {}
        queue.textChannel.send(
          "<:scrubnull:797476323533783050> **The VC I'm in is empty. Leaving the channel...**"
        );
      })

      .on("noRelated", async (queue) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) await client.playSongLog.delete();
        } catch (err) {}
        queue.textChannel.send(
          "<:scrubnull:797476323533783050> **No related music can be found. Attempting to leave the VC...**"
        );
      })

      .on("finish", async (queue) => {
        try {
          if (!client.playSongLog) {
          } else if (client.playSongLog) await client.playSongLog.delete();
        } catch (err) {}
        queue.textChannel.send(
          "<:scrubnull:797476323533783050> **The queue is now empty. Leaving the VC...**"
        );
      })

      .on("error", (channel, err) => {
        const dateTimeOptions = {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short",
        };

        const currentDate = new Date().toLocaleDateString(
          "en-US",
          dateTimeOptions
        );

        const stringErr = err.toString();

        console.log(err);
        console.log(stringErr);
        channel.send(
          `
An unexpected error occurred whie executing the event.
Please contact my owner and report the error with the text below.
\`\`\`
Last Ran: ${currentDate}

───── ERROR ─────
${err}
\`\`\`
          `
        );
      });
  },
};
