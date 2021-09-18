const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription(
      "Skip a song if there's more than 1 song in the queue, or the queue has autoplay enabled."
    ),
  group: "music",
  guildOnly: true,
  callback: async (client, interaction) => {
    const queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({
        content:
          emoji.missingEmoji +
          " Join an appropriate voice channel to commit the action.",
        ephemeral: true,
      });

    if (!queue)
      return interaction.reply({
        content:
          emoji.missingEmoji + " Must confirm that there's a queue first.",
        ephemeral: true,
      });

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

    // eslint-disable-next-line no-empty
    if (queue.songs.length > 1 || queue.autoplay) {
    } else
      return interaction.reply({
        content: emoji.denyEmoji + " There's nowhere to skip.",
        ephemeral: true,
      });

    await client.distube.skip(interaction);
    await interaction.reply("⏩ **Skipped!**");
  },
};
