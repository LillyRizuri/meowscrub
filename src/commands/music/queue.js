const Discord = require("discord.js");
const { pagination } = require("reconlx");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["queue", "q"],
  memberName: "queue",
  group: "music",
  description: "Display the server's music queue.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message) => {
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Go to the same VC that I'm blasting music out to list the queue."
      );

    if (!queue) return message.reply(emoji.missingEmoji + " There's no queue.");

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    const loopSetting = queue.repeatMode
      .toString()
      .replace("0", "Repeat Disabled")
      .replace("1", "Repeat Song")
      .replace("2", "Repeat Queue");

    const autoplaySetting = queue.autoplay
      .toString()
      .replace("true", "On")
      .replace("false", "Off");

    const audioFilter = queue.filters.join(", ") || "No filters present";

    const nowPlaying = `[${queue.songs[0].name}](${queue.songs[0].url}) | \`${queue.songs[0].formattedDuration} Requested by: ${queue.songs[0].user.tag}\``;

    const mainQueue = [...queue.songs];
    mainQueue.shift();
    const queueMap = mainQueue
      .map(
        (song, id) =>
          `\`${id + 1}.\` [${song.name}](${song.url}) | \`${
            song.formattedDuration
          } Requested by: ${song.user.tag}\`\n`
      )
      .join("\n");

    let queueList = `__Now Playing:__\n${nowPlaying}\n\n__Up Next:__`;
    if (queueMap) {
      queueList = queueList + `\n${queueMap}`;
    } else if (!queueMap) {
      queueList = queueList + "\nThere's nothing in here. Add some music!";
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
      char: "\n",
      prepend: "",
      append: "",
    });

    if (splitQueue.length === 1) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(
          `${howManySongs} | Queue Duration: ${queue.formattedDuration}`
        )
        .setDescription(splitQueue[0])
        .setFooter(
          `Volume: ${queue.volume}% - ${audioFilter} - ${loopSetting} - Autoplay ${autoplaySetting}`
        )
        .setTimestamp();
      return message.channel.send({ embeds: [embed] });
    }

    const embeds = [];
    for (let i = 0; i < splitQueue.length; i++) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setTitle(
          `${howManySongs} | Queue Duration: ${queue.formattedDuration}`
        )
        .setDescription(splitQueue[i])
        .setFooter(
          `Volume: ${queue.volume}% - ${audioFilter} - ${loopSetting} - Autoplay ${autoplaySetting}`
        )
        .setTimestamp();
      embeds.push(embed);
    }

    pagination({
      embeds: embeds,
      author: message.author,
      channel: message.channel,
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
