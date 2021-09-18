const { SlashCommandBuilder } = require("@discordjs/builders");

const emoji = require("../../assets/json/tick-emoji.json");

const notTimestampMsg = emoji.denyEmoji + " That is NOT a valid timestamp.";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rewind")
    .setDescription(
      "Move the playhead by rewinding a certain amount of time."
    )
    .addStringOption((option) =>
      option
        .setName("timestamp")
        .setDescription("A timestamp to rewind ( hh:mm:ss | mm:ss | ss )")
        .setRequired(true)
    ),
  group: "music",
  examples: ["rewind 26", "rewind 05:20", "rewind 01:11:15"],
  guildOnly: true,
  callback: async (client, interaction) => {
    const seekValue = interaction.options.getString("timestamp");
    const actualSeekValue = seekValue.split(":");
    const queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({
        content:
          emoji.missingEmoji + " Join an appropriate voice channel right now.",
        ephemeral: true,
      });

    if (!queue)
      return interaction.reply({
        content: emoji.missingEmoji + " A queue is required to do that action.",
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

    let seconds = 0;
    // Now converting the value into milliseconds
    if (seekValue.length < 3) {
      seconds = +seekValue;
      if (seekValue > 59) {
        return interaction.reply({ content: notTimestampMsg, ephemeral: true });
      }
    } else if (seekValue.length < 6) {
      seconds = +actualSeekValue[0] * 60 + +actualSeekValue[1];
      if (+actualSeekValue[0] > 59 || +actualSeekValue[1] > 59) {
        return interaction.reply({ content: notTimestampMsg, ephemeral: true });
      }
    } else {
      seconds =
        +actualSeekValue[0] * 3600 +
        +actualSeekValue[1] * 60 +
        +actualSeekValue[2];
      if (
        +actualSeekValue[0] > 23 ||
        +actualSeekValue[1] > 59 ||
        +actualSeekValue[2] > 59
      ) {
        return interaction.reply({ content: notTimestampMsg, ephemeral: true });
      }
    }

    let seekLocation = Math.trunc(queue.currentTime - seconds);

    if (isNaN(seconds) || !Number.isInteger(seconds) || seconds < 0)
      return interaction.reply({ content: notTimestampMsg, ephemeral: true });

    if (seekLocation < 0) seekLocation = 0;

    await client.distube.seek(interaction, seekLocation);
    await interaction.reply(
      emoji.successEmoji +
        ` Moved the playhead to **${new Date(seekLocation * 1000)
          .toISOString()
          .substr(11, 8)}**.`
    );
  },
};
