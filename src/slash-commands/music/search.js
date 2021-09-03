const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");

const util = require("../../util/util");

const emoji = require("../../assets/json/tick-emoji.json");

const abortId = "cancelSearch";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for music on the selection pane!")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("Input to search for music")
        .setRequired(true)
    ),
  group: "music",
  examples: ["search daft punk"],
  clientPermissions: ["EMBED_LINKS"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const music = interaction.options.getString("search-string");
    let queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({
        content:
          emoji.missingEmoji + " Join an appropriate voice channel right now.",
        ephemeral: true,
      });

    const permissions = voiceChannel.permissionsFor(client.user);

    if (!permissions.has("CONNECT"))
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " I don't think I can connect to the VC that you are in.\nPlease try again in another VC.",
        ephemeral: true,
      });

    if (!permissions.has("SPEAK"))
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " I don't think that I can transmit music into the VC.\nPlease contact your nearest server administrator.",
        ephemeral: true,
      });

    if (queue)
      if (
        interaction.member.guild.me.voice.channelId !==
        interaction.member.voice.channelId
      )
        return interaction.reply({
          content:
            emoji.denyEmoji +
            " You need to be in the same VC with me in order to continue.",
          ephemeral: true,
        });

    if (music.length >= 1024)
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " Your search query musn't be longer than/equal 1024 characters.",
        ephemeral: true,
      });

    await interaction.reply(
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
                label: util.trim(song.name, 100),
                value: id.toString(),
                description: util.trim(`${song.uploader.name} - ${duration}`),
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

    const initialMessage = await interaction.channel.send({
      content:
        "Please choose single, or multiple songs below.",
      components: [component1(false), component2(false)],
    });

    const filter = (inter) => inter.user.id === interaction.user.id;
    initialMessage
      .awaitMessageComponent({
        filter,
        time: 30000,
      })
      .then(async (inter) => {
        if (inter.customId === abortId) {
          await inter.deferUpdate();
          await initialMessage.edit({
            content: "**Cancelled the operation.**",
            components: [component1(true), component2(true)],
          });
          return;
          // eslint-disable-next-line no-empty
        } else {
        }

        await inter.deferUpdate();
        await initialMessage.edit({
          content: "Please wait...",
          components: [component1(true), component2(true)],
        });

        for (const value of inter.values) {
          const chosenSong = results[value];
          if (queue) queue.searched = true;

          await client.distube.playVoiceChannel(voiceChannel, chosenSong, {
            textChannel: interaction.channel,
            member: interaction.member,
          });

          if (!queue) {
            queue = await client.distube.getQueue(interaction);
            queue.searched = true;
          }
        }

        if (inter.values.length === 1) {
          const [value] = inter.values;
          await initialMessage.edit(
            `🎶 Queued **${results[value].name} - ${results[value].formattedDuration}**`
          );
        } else {
          await initialMessage.edit(
            `🎶 **Added ${inter.values.length} song(s) to the server queue.**`
          );
        }
      })
      .catch(async () => {
        await initialMessage.edit({
          content: "**No chosen song after 1 minute, operation canceled.**",
          components: [component1(true), component2(true)],
        });
      });
  },
};
