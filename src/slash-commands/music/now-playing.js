const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const progressbar = require("string-progressbar");

const emoji = require("../../assets/json/tick-emoji.json");

const slider = "\\🔘";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("now-playing")
    .setDescription(
      "Display what music I'm playing, and the current playhead location."
    ),
  group: "music",
  guildOnly: true,
  callback: async (client, interaction) => {
    const queue = await client.distube.getQueue(interaction);

    if (!queue)
      return interaction.reply({
        content: emoji.missingEmoji + " No queue found for this server.",
        ephemeral: true,
      });

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
    interaction.reply({ embeds: [npEmbed] });
  },
};
