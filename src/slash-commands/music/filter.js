const { SlashCommandBuilder } = require("@discordjs/builders");
const client = require("../../index");

const allFilters = Object.keys(client.distube.filters).map((key) => [key, key]);
allFilters.push(["off", "off"]);

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filter")
    .setDescription("Set multiple music filters for the queue.")
    .addStringOption((option) =>
      option
        .setName("filter-name")
        .setDescription("The filter's name")
        .addChoices(allFilters)
    ),
  group: "music",
  details: `
To remove all filters, type "off" instead of a normal audio filter name.
To remove one filter that's applied to the queue, type the audio filter that you want to remove.
All effects can be found here: https://distube.js.org/#/docs/DisTube/beta/typedef/defaultFilters`,
  examples: ["filter vaporwave"],
  guildOnly: true,
  // eslint-disable-next-line no-shadow
  callback: async (client, interaction) => {
    const chosenFilter = interaction.options._hoistedOptions[0]
      ? interaction.options._hoistedOptions[0].value
      : "";
    const queue = await client.distube.getQueue(interaction);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel)
      return interaction.reply({
        content:
          emoji.missingEmoji +
          " Go to the same VC that I'm blasting music to configure filters.",
        ephemeral: true,
      });

    if (!queue)
      return interaction.reply({
        content:
          emoji.missingEmoji +
          " There's no queue. Have at least one song before advancing.",
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

    if (!chosenFilter && queue.filters.length > 0)
      return interaction.reply(
        emoji.successEmoji +
          ` Current audio filters: **${queue.filters.join(", ")}**`
      );
    else if (!chosenFilter && queue.filters.length < 1)
      return interaction.reply({
        content:
          emoji.missingEmoji +
          " There's no audio filter set in this server's queue.\nPlease set one by referring to this site: <https://distube.js.org/#/docs/DisTube/beta/typedef/defaultFilters>",
        ephemeral: true,
      });

    if (chosenFilter === "off" && queue.filters.length > 0) {
      await client.distube.setFilter(interaction, queue.filters);
      return interaction.reply(
        emoji.successEmoji + " **Successfully removed all audio filters.**"
      );
    } else if (chosenFilter === "off" && queue.filters.length < 1)
      return interaction.reply({
        content:
          emoji.denyEmoji +
          " There's no active audio filters. What are you doing?",
        ephemeral: true,
      });

    for (const filter of queue.filters) {
      if (chosenFilter === filter) {
        await client.distube.setFilter(interaction, filter);
        return interaction.reply(
          emoji.successEmoji +
            ` Successfully removed this audio filter: **${filter}**`
        );
      }
    }

    await client.distube.setFilter(interaction, chosenFilter);
    await interaction.reply(
      emoji.successEmoji +
        ` Successfully added an audio filter: **${chosenFilter}**.`
    );
  },
};
