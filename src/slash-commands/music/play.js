const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Very simple music command with NO ability to play provided video/audio attachments."
    )
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("Input to search for music")
        .setRequired(true)
    ),
  group: "music",
  details:
    "Due to slash commands not supporting attachments as arguments, it's not possible to play provided video/audio attachments.",
  examples: ["play very noise"],
  clientPermissions: ["EMBED_LINKS"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const music = interaction.options.getString("search-string");
    const queue = await client.distube.getQueue(interaction);
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

    await interaction.reply("🔍 **Searching and attempting...**");
    client.distube.playVoiceChannel(voiceChannel, music, {
      textChannel: interaction.channel,
      member: interaction.member,
    });
  },
};
