const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause/Resume the music playback."),
  group: "music",
  details: "Running the command while the player is paused will resume it.",
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
        content: emoji.missingEmoji + " There's no queue for this server.",
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

    if (!queue.playing) {
      await client.distube.resume(interaction);
      await interaction.reply(
        emoji.successEmoji + " **Resumed the current track.**"
      );
    } else if (queue.playing) {
      await client.distube.pause(interaction);
      await interaction.reply(
        emoji.successEmoji + " **Paused the current track.**"
      );
    }
  },
};
