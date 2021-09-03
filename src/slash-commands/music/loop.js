const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Repeat a single music or a queue.")
    .addStringOption((option) =>
      option
        .setName("loop-option")
        .setDescription("Option for repeating music/queue")
        .addChoices([
          ["song", "song"],
          ["queue", "queue"],
          ["off", "off"],
        ])
    ),
  group: "music",
  details:
    "Running the command with no arguments and the command output will display the current music repeat config.",
  examples: ["loop song", "loop queue", "loop off"],
  guildOnly: true,
  callback: async (client, interaction) => {
    let mode = null;
    const args = interaction.options.getString("loop-option");
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

    const loopSetting = queue.repeatMode
      .toString()
      .replace("0", "Disabled")
      .replace("1", "Song")
      .replace("2", "Queue");

    if (!args)
      return interaction.reply(
        emoji.successEmoji + ` Current repeat configuration: **${loopSetting}**`
      );

    switch (args) {
      case "off":
        mode = 0;
        break;
      case "song":
        mode = 1;
        break;
      case "queue":
        mode = 2;
        break;
    }

    mode = client.distube.setRepeatMode(interaction, mode);
    mode = mode ? (mode == 2 ? "Repeat Queue" : "Repeat Song") : "Off";
    interaction.reply(emoji.successEmoji + ` Set repeat mode to: **${mode}**`);
  },
};
