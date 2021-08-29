const Discord = require("discord.js");
const { getSong, searchSong } = require("genius-lyrics-api");

const util = require("../../util/util");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["lyrics", "lyric", "ly"],
  memberName: "lyrics",
  group: "music",
  description: "Search for song lyrics using a song's name.",
  format: "<searchString>",
  examples: ["lyrics here comes the sun"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  callback: async (client, message, args) => {
    const options = {
      apiKey: process.env.GENIUS,
      title: args,
      artist: "",
      optimizeQuery: false,
    };

    if (!args)
      return message.reply(emoji.missingEmoji + " The search query is blank.");

    message.channel.send(
      `🔍 **Searching for:** \`${args}\`\nPlease be patient, this will take a while...`
    );

    const song = await getSong(options);
    const searchSongInfo = await searchSong(options);
    const firstSongInfo = searchSongInfo[0];

    try {
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

      message.channel.send({ embeds: [lyricsEmbed] });
    } catch (err) {
      return message.reply(emoji.denyEmoji + ` No results for: **${args}**.`);
    }
  },
};
