const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["nowplaying", "np", "songinfo"],
  memberName: "nowplaying",
  group: "music",
  description:
    "Display what music I'm playing, and the current playhead location.",
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message) => {
    const queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          " Join an appropriate voice channel to commit the action."
      );

    if (!queue)
      return message.reply(
        emoji.missingEmoji + " No queue found for this server."
      );

    if (message.guild.me.voice.channelId !== message.member.voice.channelId)
      return message.reply(
        emoji.denyEmoji +
          " You need to be in the same VC with me in order to continue."
      );

    let currentPlayhead = `${queue.formattedCurrentTime}/${queue.songs[0].formattedDuration}`;

    if (queue.songs[0].isLive) currentPlayhead = "Live";
    else if (
      queue.filters &&
      ["nightcore", "vaporwave", "reverse"].some((element) =>
        queue.filters.includes(element)
      )
    ) {
      currentPlayhead = "No accurate playhead due to your filter";
    }

    const npEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Now Playing")
      .setTitle(queue.songs[0].name)
      .setURL(queue.songs[0].url)
      .setThumbnail(queue.songs[0].thumbnail).setDescription(`
• **Requested by:** \`${queue.songs[0].user.tag}\`
• **Current Playhead:** \`${currentPlayhead}\`
            `);
    message.channel.send({ embeds: [npEmbed] });
  },
};
