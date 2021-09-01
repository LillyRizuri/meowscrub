const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autoplay")
    .setDescription("Enable/Disable autoplay by running the command."),
  group: "music",
  guildOnly: true,
  callback: async (client, interaction) => {
    let mode = null;
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

    mode = client.distube.toggleAutoplay(interaction);
    mode = mode ? "On" : "Off";
    interaction.reply(
      emoji.successEmoji + ` Set autoplay mode to **${mode}**.`
    );
  },
};
