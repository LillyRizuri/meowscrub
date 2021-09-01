const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription(
      "Adjust the volume control of the server queue in percentage."
    )
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Percentage of the audio volume")
        .setRequired(true)
    ),
  group: "music",
  details: "List the queue to know which one to remove first.",
  examples: ["delete-song 2"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const args = interaction.options._hoistedOptions[0].value;
    const queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({
        content:
          emoji.missingEmoji +
          " Join an appropriate voice channel to configure that.",
        ephemeral: true,
      });

    if (!queue)
      return interaction.reply({
        content: emoji.missingEmoji + " Where's the server queue?",
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

    const volume = Number(args);
    if (isNaN(volume) || !Number.isInteger(volume))
      return interaction.reply({
        content: emoji.denyEmoji + " Percentage not valid. Try again.",
        ephemeral: true,
      });

    if (volume < 1 || volume > 200)
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " The percentage you provided must be in-between 1 - 200%. No higher than that.",
        ephemeral: true,
      });

    await client.distube.setVolume(interaction, volume);
    await interaction.reply(
      emoji.successEmoji + ` Adjusted the audio volume to **${volume}%**.`
    );
  },
};
