const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { pagination } = require("reconlx");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Display the server's music queue."),
  group: "music",
  clientPermissions: ["EMBED_LINKS"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const queue = await client.distube.getQueue(interaction);

    if (!queue)
      return interaction.reply({
        content: emoji.missingEmoji + " There's no queue.",
        ephemeral: true,
      });

    interaction.reply("🔍 **Fetching all data...**");

    const loopSetting = queue.repeatMode
      .toString()
      .replace("0", "Repeat Disabled")
      .replace("1", "Repeat Song")
      .replace("2", "Repeat Queue");

    const autoplaySetting = queue.autoplay
      .toString()
      .replace("true", "On")
      .replace("false", "Off");

    const audioFilter =
      queue.filters.join(", ").toProperCase() || "No filters present";

    const nowPlaying = `[${queue.songs[0].name}](${queue.songs[0].url})\n⠀• \`${queue.songs[0].formattedDuration} Requested by: ${queue.songs[0].user.tag}\``;

    const mainQueue = [...queue.songs];
    mainQueue.shift();

    const queueMap = mainQueue
      .map(
        (song, id) =>
          `\`${id + 1}.\` [${song.name}](${song.url})\n⠀• \`${
            song.formattedDuration
          } Requested by: ${song.user.tag}\`\n`
      )
      .join("\n");

    let queueList = `__Now Playing:__\n${nowPlaying}\n\n__Up Next:__`;
    if (queueMap) {
      queueList += `\n${queueMap}`;
    } else if (!queueMap) {
      queueList += "\nThere's nothing in here. Add some music!";
    }

    let howManySongs;
    switch (queue.songs.length) {
      case 1:
        howManySongs = `${queue.songs.length} song`;
        break;
      default:
        howManySongs = `${queue.songs.length} songs`;
        break;
    }

    const splitQueue = Discord.Util.splitMessage(queueList, {
      maxLength: 2048,
      char: "\n\n",
      prepend: "",
      append: "",
    });

    const embeds = [];
    for (const queuePart of splitQueue) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(
          `${howManySongs} | Queue Duration: ${queue.formattedDuration}`
        )
        .setDescription(queuePart)
        .setFooter(
          `Volume: ${queue.volume}% - ${audioFilter} - ${loopSetting} - Autoplay ${autoplaySetting}`
        )
        .setTimestamp();
      embeds.push(embed);
    }

    pagination({
      embeds: embeds,
      author: interaction.user,
      channel: interaction.channel,
      fastSkip: true,
      time: 60000,
      button: [
        {
          name: "first",
          emoji: emoji.firstEmoji,
          style: "PRIMARY",
        },
        {
          name: "previous",
          emoji: emoji.leftEmoji,
          style: "PRIMARY",
        },
        {
          name: "next",
          emoji: emoji.rightEmoji,
          style: "PRIMARY",
        },
        {
          name: "last",
          emoji: emoji.lastEmoji,
          style: "PRIMARY",
        },
      ],
    });
  },
};
