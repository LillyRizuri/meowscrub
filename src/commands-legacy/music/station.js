const Discord = require("discord.js");
const RadioBrowser = require("radio-browser");

const util = require("../../util/util");

const emoji = require("../../assets/json/tick-emoji.json");

const abortId = "cancelSearch";

module.exports = {
  aliases: ["station", "radio"],
  memberName: "station",
  group: "music",
  description: "Search for a radio station on the selection pane!",
  format: "<searchString>",
  examples: ["station hip-hop"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const music = args;
    let queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji + " Join an appropriate voice channel right now."
      );

    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!permissions.has("CONNECT"))
      return message.reply(
        emoji.denyEmoji +
          " I don't think I can connect to the VC that you are in.\nPlease try again in another VC."
      );

    if (!permissions.has("SPEAK"))
      return message.reply(
        emoji.denyEmoji +
          " I don't think that I can transmit music into the VC.\nPlease contact your nearest server administrator."
      );

    if (queue)
      if (message.guild.me.voice.channelId !== message.member.voice.channelId)
        return message.reply(
          emoji.denyEmoji +
            " You need to be in the same VC with me in order to continue."
        );

    if (!music)
      return message.reply(
        emoji.missingEmoji +
          " You didn't search for a radio station. Try again."
      );

    if (music.length >= 1024)
      return message.reply(
        emoji.denyEmoji +
          " Your search query musn't be longer than/equal 1024 characters."
      );

    message.channel.send(
      `🔍 **Searching for station: \`${music}\` and adding selections...**`
    );

    const results = (
      await RadioBrowser.searchStations({
        name: music,
      })
    ).slice(0, 25);

    if (results.length === 0)
      return message.reply(
        emoji.denyEmoji + ` No results found for: \`${music}\`.`
      );

    const component1 = (state) =>
      new Discord.MessageActionRow().addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId("searchRadioStation")
          .setPlaceholder(
            state ? "Selection unavailable." : "Awaiting for music selection..."
          )
          .setMinValues(1)
          .setDisabled(state)
          .addOptions(
            results.map((station, id) => {
              return {
                label: util.trim(station.name, 100),
                value: id.toString(),
                description: `Language: ${
                  station.language ? station.language.toProperCase() : "Unknown"
                }`,
              };
            })
          )
      );

    const component2 = (state) =>
      new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton()
          .setStyle("DANGER")
          .setCustomId(abortId)
          .setLabel("Cancel Operation")
          .setDisabled(state)
      );

    const initialMessage = await message.channel.send({
      content: "Please choose a single station below.",
      components: [component1(false), component2(false)],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    initialMessage
      .awaitMessageComponent({
        filter,
        time: 30000,
      })
      .then(async (interaction) => {
        if (interaction.customId === abortId) {
          await interaction.deferUpdate();
          await initialMessage.edit({
            content: "**Cancelled the operation.**",
            components: [component1(true), component2(true)],
          });
          return;
        }

        await interaction.deferUpdate();
        await initialMessage.edit({
          content: "Please wait...",
          components: [component1(true), component2(true)],
        });

        for (const value of interaction.values) {
          const chosenStation = results[value];
          const urlStream = chosenStation.url_resolved.replace(/\/+$/, "");
          if (queue) queue.searched = true;

          await client.distube.play(message, urlStream);

          queue = await client.distube.getQueue(message);
          const playedSong = queue.songs.find((song) => song.url === urlStream);

          playedSong.name = chosenStation.name;
          playedSong.isLive = true;
          playedSong.formattedDuration = "Live";

          if (!queue) {
            queue = await client.distube.getQueue(message);
            queue.searched = true;
          }
        }

        if (interaction.values.length === 1) {
          const [value] = interaction.values;
          await initialMessage.edit(`🎶 Queued **${results[value].name}**`);
        } else {
          await initialMessage.edit(
            `🎶 **Added ${interaction.values.length} station(s) to the server queue.**`
          );
        }
      })
      .catch(async () => {
        await initialMessage.edit({
          content: "**No chosen station after 1 minute, operation cancelled.**",
          components: [component1(true), component2(true)],
        });
      });
  },
};
