const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { getSong, searchSong } = require("genius-lyrics-api");

const util = require("../../util/util");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Search for song lyrics using a song's name.")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("Input to search for song lyrics")
    ),
  group: "music",
  examples: ["lyrics here comes the sun"],
  callback: async (client, interaction) => {
    let searchString = interaction.options._hoistedOptions[0]
      ? interaction.options._hoistedOptions[0].value
      : "";

    const queue = await client.distube.getQueue(interaction);

    if (!searchString && queue) {
      searchString = queue.songs[0].name;
    } else if (!searchString && !queue) {
      return interaction.reply({
        content: emoji.missingEmoji + " The search query is blank.",
        ephemeral: true,
      });
    }

    const options = {
      apiKey: process.env.GENIUS,
      title: searchString,
      artist: "",
      optimizeQuery: false,
    };

    interaction.reply(
      `🔍 **Searching for:** \`${searchString}\`\nPlease be patient, this will take a while...`
    );

    const song = await getSong(options);
    const searchSongInfo = await searchSong(options);
    try {
      const firstSongInfo = searchSongInfo[0];
      const splitLyrics = Discord.Util.splitMessage(
        util.trim(song.lyrics, 5700),
        {
          maxLength: 1024,
          char: "\n",
          prepend: "",
          append: "",
        }
      );

      const lyricsEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`Results for: ${firstSongInfo.title}`)
        .setDescription(`Genius ID Match: [${song.id}](${song.url})`)
        .setFooter("Lyrics Provided by Genius")
        .setTimestamp();

      splitLyrics.map(async (part) => {
        lyricsEmbed.addFields({
          name: "\u200b",
          value: part,
        });
      });

      interaction.channel.send({ embeds: [lyricsEmbed] });
    } catch (err) {
      interaction.channel.send(
        `${interaction.user.toString()} ` +
          emoji.denyEmoji +
          ` No results for: **${searchString}**.`
      );
    }
  },
};
