const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Stop the music playback and leave the voice channel."),
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
          emoji.missingEmoji + " There's no music playing. What's the point?",
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

    if (client.playSongLog)
      try {
        await client.playSongLog.delete();
        // eslint-disable-next-line no-empty
      } catch (err) {}

    await client.distube.stop(interaction);
    await interaction.reply(
      emoji.successEmoji + " **Stopped the track, and cleaned the queue.**"
    );
  },
};
