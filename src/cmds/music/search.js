const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class SearchMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "search",
      aliases: ["findsong"],
      group: "music",
      memberName: "search",
      argsType: "single",
      description:
        "Search a music and I list the results here. Then, you can play it by typing a search results' ID.",
      details: "Only the first 15 results will be shown.",
      format: "<string>",
      examples: ["search daft punk"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const music = args;
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to provide you music."
      );

    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!permissions.has("CONNECT"))
      return message.reply(
        "<:scrubred:797476323169533963> I don't think I can connect to the VC that you are in.\nPlease try again in another VC."
      );

    if (!permissions.has("SPEAK"))
      return message.reply(
        "<:scrubred:797476323169533963> I don't think that I can transmit music into the VC..."
      );

    if (!music)
      return message.reply(
        "<:scrubnull:797476323533783050> I didn't see you searching for a specific music."
      );

    const results = await this.client.distube.search(music);
    const resultsMap = results
      .map(
        (song, id) =>
          `\`${id + 1}.\` [${song.name}](${song.url}) | \`${
            song.formattedDuration
          }\`\n`
      )
      .join("\n");

    const splitResults = Discord.splitMessage(resultsMap, {
      maxLength: 1024,
      char: "\n",
      prepend: "",
      append: "",
    });

    const searchResultsEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`Search Results for: ${music}`)
      .setDescription(splitResults)
      .setFooter(
        "Type in a music results' ID (number that matches a music result) to play or add the specified the music to the queue. You have 1 minute."
      );

    const filter = (m) => m.author === message.author;

    await message.channel.send(searchResultsEmbed);
    await message.channel
      .awaitMessages(filter, { max: 1, time: 60000 })
      .then(async (collected) => {
        const chosenMusic = Number(collected.first().content);

        if (collected.first().content.toLowerCase() === "cancel")
          return message.reply(
            "<:scrubgreen:797476323316465676> Canceled the operation."
          );

        if (
          isNaN(chosenMusic) ||
          !Number.isInteger(chosenMusic) ||
          chosenMusic < 1 ||
          chosenMusic > 15
        )
          return message.reply(
            "<:scrubred:797476323169533963> Huh? That's NOT a valid music results' ID."
          );

          this.client.distube.play(
            message,
            results[collected.first().content - 1]
          );
      })
      .catch(() => {
        message.channel.send(
          "No chosen song after 1 minute, operation canceled."
        );
      });
  }
};
