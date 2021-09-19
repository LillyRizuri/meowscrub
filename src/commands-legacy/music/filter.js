const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["filter", "effect"],
  memberName: "filter",
  group: "music",
  description: "Set multiple music filters for the queue.",
  details: `
To remove all filters, type "off" instead of a normal audio filter name.
To remove one filter that's applied to the queue, type the audio filter that you want to remove.
All effects can be found here: https://distube.js.org/#/docs/DisTube/beta/typedef/defaultFilters`,
  // eslint-disable-next-line quotes
  format: '[filterName | "off"]',
  examples: ["filter vaporwave"],
  cooldown: 3,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Go to the same VC that I'm blasting music to configure filters."
      );

    if (!queue)
      return message.reply(
        emoji.missingEmoji +
          " There's no queue. Have at least one song before advancing."
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    if (!args && queue.filters.length > 0)
      return message.reply(
        emoji.successEmoji +
          ` Current audio filters: **${queue.filters.join(", ")}**`
      );
    else if (!args && queue.filters.length < 1)
      return message.reply(
        emoji.missingEmoji +
          " There's no audio filter set in this server's queue.\nPlease set one by referring to this site: <https://distube.js.org/#/docs/DisTube/beta/typedef/defaultFilters>"
      );

    if (args.toLowerCase() === "off" && queue.filters.length > 0) {
      await client.distube.setFilter(message, queue.filters);
      return message.channel.send(
        emoji.successEmoji + " **Successfully removed all audio filters.**"
      );
    } else if (args.toLowerCase() === "off" && queue.filters.length < 1)
      return message.reply(
        emoji.denyEmoji +
          " There's no active audio filters. What are you doing?"
      );

    for (const filter of queue.filters) {
      if (args.toLowerCase() === filter) {
        await client.distube.setFilter(message, filter);
        return message.channel.send(
          emoji.successEmoji +
            ` Successfully removed this audio filter: **${filter}**`
        );
      }
    }

    try {
      await client.distube.setFilter(message, args);
      await message.channel.send(
        emoji.successEmoji +
          ` Successfully added an audio filter: **${args.toLowerCase()}**.`
      );
    } catch (err) {
      message.reply(
        emoji.denyEmoji +
          " Sorry? That's NOT a valid audio filter.\nAll available audio filters can be seen here: <https://distube.js.org/#/docs/DisTube/3.0.0-beta.35/typedef/DefaultFilters>"
      );
    }
  },
};
