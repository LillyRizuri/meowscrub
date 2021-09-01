const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-song")
    .setDescription(
      "Remove a song from the current music queue using a music queue's ID."
    )
    .addIntegerOption((option) =>
      option
        .setName("music-id")
        .setDescription("The music's ID in the queue")
        .setRequired(true)
    ),
  group: "music",
  details: "List the queue to know which one to remove first.",
  examples: ["delete-song 2"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const musicNumber = interaction.options._hoistedOptions[0].value;
    const queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({
        content:
          emoji.missingEmoji +
          " Go to the same VC that I'm blasting music to do that action.",
        ephemeral: true,
      });

    if (!queue)
      return interaction.reply({
        content: emoji.missingEmoji + " There's no queue to do that action.",
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

    if (
      musicNumber <= 0 ||
      isNaN(musicNumber) ||
      !Number.isInteger(musicNumber)
    )
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " Right off the bat, I can see that the value isn't valid.",
        ephemeral: true,
      });

    try {
      try {
        await interaction.reply(
          emoji.successEmoji +
            ` Removed this song which matches this music queue's ID:
\`\`\`
${musicNumber}. ${queue.songs[musicNumber].name} - ${queue.songs[musicNumber].formattedDuration}
Music requested by ${queue.songs[musicNumber].user.tag}
\`\`\`
                `
        );
      } finally {
        await queue.songs.splice(musicNumber, 1);
      }
    } catch (err) {
      interaction.reply({
        content:
          emoji.denyEmoji +
          " That ID doesn't match with any songs found in the queue.",
        ephemeral: true,
      });
    }
  },
};
