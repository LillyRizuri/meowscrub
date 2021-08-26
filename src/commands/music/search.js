const Discord = require("discord.js");

const modules = require("../../util/modules");

const emoji = require("../../assets/json/tick-emoji.json");

const abortId = "cancelSearch";

module.exports = {
  aliases: ["search", "findsong"],
  memberName: "search",
  group: "music",
  description: "Search for music on the selection pane!",
  format: "<searchString>",
  examples: ["play daft punk"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
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
        emoji.missingEmoji + " I didn't see you searching for a specific music."
      );

    if (music.length >= 1024)
      return message.reply(
        emoji.denyEmoji +
          " Your search query musn't be longer than/equal 1024 characters."
      );

    message.channel.send(
      `🔍 **Searching for: \`${music}\` and adding selections...**`
    );
    const results = await client.distube.search(music, {
      safeSearch: true,
      limit: 25,
    });

    const component1 = (state) =>
      new Discord.MessageActionRow().addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId("searchMenu")
          .setPlaceholder(
            state ? "Selection unavailable." : "Awaiting for music selection..."
          )
          .setMinValues(1)
          .setMaxValues(10)
          .setDisabled(state)
          .addOptions(
            results.map((song, id) => {
              let duration = "";
              if (song.duration === 0) {
                duration = "Live";
              } else {
                duration = song.formattedDuration;
              }

              return {
                label: modules.trim(song.name, 100),
                value: (id + 1).toString(),
                description: modules.trim(
                  `${song.uploader.name} - ${duration}`
                ),
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
      content:
        "Please choose single, or multiple songs below. (Maximum of 10 songs)",
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
        // eslint-disable-next-line no-empty
        } else {
        }

        for (const value of interaction.values) {
          const chosenSong = results[value - 1];
          if (queue) queue.searched = true;

          await client.distube.play(message, chosenSong);

          if (!queue) {
            queue = await client.distube.getQueue(message);
            queue.searched = true;
          }
        }

        await interaction.deferUpdate();
        await initialMessage.edit({
          content: `🎶 **Added ${interaction.values.length} song(s) to the server queue.**`,
          components: [component1(true), component2(true)],
        });
      })
      .catch(async () => {
        await initialMessage.edit({
          content: "**No chosen song after 1 minute, operation canceled.**",
          components: [component1(true), component2(true)],
        });
      });
  },
};
