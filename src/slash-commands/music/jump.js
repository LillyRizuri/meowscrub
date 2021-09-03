const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jump from one music to another using a music queue's ID.")
    .addIntegerOption((option) =>
      option
        .setName("music-id")
        .setDescription("The music's ID in the queue")
        .setRequired(true)
    ),
  group: "music",
  details:
    "List the queue to know which one to jump first. THIS ACTION WILL ALSO OVERWRITE ALL SONGS BEFORE YOUR CHOSEN MUSIC!",
  examples: ["jump 3"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const musicNumber = interaction.options.getInteger("music-id");
    const queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({
        content:
          emoji.missingEmoji +
          " Go to the same VC that I'm blasting music out to jump through music.",
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
      await client.distube.jump(interaction, parseInt(musicNumber));
      await interaction.reply(
        `⏩ Jumped to a music with the song number: **${musicNumber}**.`
      );
    } catch (err) {
      interaction.reply({
        content: emoji.denyEmoji + " Completely invalid song number.",
        ephemeral: true,
      });
    }
  },
};
