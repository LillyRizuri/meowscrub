const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { PaginatedEmbed } = require("embed-paginator");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class ListQueueCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "queue",
      aliases: ["q"],
      group: "music",
      memberName: "queue",
      description: "Display the guild's music queue.",
      clientPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    const queue = await this.client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to list the queue."
      );

    if (!queue)
      return message.reply("<:scrubnull:797476323533783050> There's no queue.");

    const inSameChannel = this.client.voice.connections.some(
      (connection) => connection.channel.id === message.member.voice.channelID
    );

    if (!inSameChannel)
      return message.reply(
        "<:scrubred:797476323169533963> You need to be in the same VC as the bot in order to continue."
      );

    const loopSetting = queue.repeatMode
      .toString()
      .replace("0", "Disabled")
      .replace("1", "Song")
      .replace("2", "Queue");

    const autoplaySetting = queue.autoplay
      .toString()
      .replace("true", "On")
      .replace("false", "Off");

    const audioFilter = queue.filter || "Off";

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

    const currentQueueEmbed = new PaginatedEmbed({
      colours: [embedcolor],
      descriptions: splitQueue,
      duration: 60 * 1000,
      paginationType: "description",
      itemsPerPage: 1,
    })
      .setTitle(`${howManySongs} | Queue Duration: ${queue.formattedDuration}`)
      .setAuthor(
        `Volume: ${queue.volume}% | Filter: ${audioFilter} | Loop: ${loopSetting} | Autoplay: ${autoplaySetting}`
      )
      .setTimestamp();

    currentQueueEmbed.send(message.channel);
  }
};
