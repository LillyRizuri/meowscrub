const Discord = require("discord.js");
const progressbar = require("string-progressbar");

const emoji = require("../../assets/json/tick-emoji.json");

const slider = "\\🔘";

module.exports = {
  aliases: ["now-playing", "np", "song-info"],
  memberName: "nowplaying",
  group: "music",
  description:
    "Display what music I'm playing, and the current playhead location.",
  cooldown: 3,
  guildOnly: true,
  callback: async (client, message) => {
    const queue = await client.distube.getQueue(message);

    if (!queue)
      return message.reply(
        emoji.missingEmoji + " No queue found for this server."
      );

    let currentPlayhead = `${queue.formattedCurrentTime}/${queue.songs[0].formattedDuration}: `;
    let videoProgressBar = "";

    if (queue.songs[0].isLive) {
      currentPlayhead = "◉ LIVE: ";
      videoProgressBar = progressbar.splitBar(10, 10, 20, "▬", slider)[0];
    } else if (
      queue.filters &&
      ["nightcore", "vaporwave", "reverse"].some((element) =>
        queue.filters.includes(element)
      )
    ) {
      currentPlayhead = "Inaccurate playhead due to your filter";
    } else {
      videoProgressBar = progressbar.splitBar(
        queue.songs[0].duration,
        queue.currentTime,
        20,
        "▬",
        slider
      )[0];
    }

    if (videoProgressBar && videoProgressBar.includes(slider)) {
      const betweenPlayhead = videoProgressBar.split(slider);
      betweenPlayhead[0] = `[${betweenPlayhead[0]}](${queue.songs[0].url})`;
      videoProgressBar = betweenPlayhead.join(slider);
    }

    const npEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Now Playing")
      .setTitle(queue.songs[0].name)
      .setURL(queue.songs[0].url)
      .setThumbnail(queue.songs[0].thumbnail).setDescription(`
• Music Requested by: **${queue.songs[0].user.tag}**
**${currentPlayhead}**${videoProgressBar}
            `);
    message.channel.send({ embeds: [npEmbed] });
  },
};
