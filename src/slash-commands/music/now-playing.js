const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

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

    let currentPlayhead = `${queue.formattedCurrentTime}/${queue.songs[0].formattedDuration}`;

    if (queue.songs[0].isLive) currentPlayhead = "Live";
    else if (
      queue.filters &&
      ["nightcore", "vaporwave", "reverse"].some((element) =>
        queue.filters.includes(element)
      )
    ) {
      currentPlayhead = "No accurate playhead due to your filter";
    }

    const npEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Now Playing")
      .setTitle(queue.songs[0].name)
      .setURL(queue.songs[0].url)
      .setThumbnail(queue.songs[0].thumbnail).setDescription(`
• **Requested by:** \`${queue.songs[0].user.tag}\`
• **Current Playhead:** \`${currentPlayhead}\`
              `);
    interaction.reply({ embeds: [npEmbed] });
  },
};
