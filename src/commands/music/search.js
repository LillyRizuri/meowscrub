const Discord = require("discord.js");

const modules = require("../../util/modules");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["search", "findsong"],
  memberName: "search",
  group: "music",
  description: "Search for music on the selection pane!",
  format: "<searchString>",
  examples: ["play daft punk"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const music = args;
    let queue = await client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji + " Join an appropriate voice channel right now."
      );

    const permissions = voiceChannel.permissionsFor(message.client.user);

    if (!permissions.has("CONNECT"))
      return message.reply(
        emoji.denyEmoji +
          " I don't think I can connect to the VC that you are in.\nPlease try again in another VC."
      );

    if (!permissions.has("SPEAK"))
      return message.reply(
        emoji.denyEmoji +
          " I don't think that I can transmit music into the VC.\nPlease contact your nearest server administrator."
      );

    if (queue)
      if (message.guild.me.voice.channelId !== message.member.voice.channelId)
        return message.reply(
          emoji.denyEmoji +
            " You need to be in the same VC with me in order to continue."
        );

    if (!music)
      return message.reply(
        emoji.missingEmoji + " I didn't see you searching for a specific music."
      );

    if (music.length >= 1024)
      return message.reply(
        emoji.denyEmoji +
          " Your search query musn't be longer than/equal 1024 characters."
      );

    message.channel.send(`🔍 **Searching for:** \`${music}\``);
    const results = await client.distube.search(music, {
      safeSearch: true,
      limit: 25,
    });

    await message.channel.send("🔧 **Adding selections...**");
    const components = (state) => [
      new Discord.MessageActionRow().addComponents(
        new Discord.MessageSelectMenu()
          .setCustomId("search-menu")
          .setPlaceholder(
            state ? "Selection unavailable." : "Awaiting for music selection..."
          )
          .setMinValues(1)
          .setMaxValues(10)
          .setDisabled(state)
          .addOptions(
            results.map((song, id) => {
              let duration = "";
              if (song.duration === 0) {
                duration = "Live";
              } else {
                duration = song.formattedDuration;
              }

              return {
                label: modules.trim(song.name, 100),
                value: (id + 1).toString(),
                description: modules.trim(
                  `${song.uploader.name} - ${duration}`
                ),
              };
            })
          )
      ),
    ];

    const initialMessage = await message.channel.send({
      content: "Please choose single, or multiple songs below. (Maximum of 10 songs)",
      components: components(false),
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    initialMessage
      .awaitMessageComponent({
        filter,
        time: 30000,
        componentType: "SELECT_MENU",
      })
      .then(async (interaction) => {
        interaction.deferUpdate();
        initialMessage.edit({
          content: `**Selected ${interaction.values.length} song(s).**`,
          components: components(true),
        });

        for (const value of interaction.values) {
          const chosenSong = results[value - 1];
          if (queue) queue.searched = true;

          await client.distube.play(message, chosenSong);

          if (!queue) {
            queue = await client.distube.getQueue(message);
            queue.searched = true;
          }
        }

        message.channel.send(
          `🎶 **Added ${interaction.values.length} song(s) to the server queue.**`
        );
      })
      .catch((err) => {
        console.log(err);
        initialMessage.edit({
          content: "No chosen song after 1 minute, operation canceled.",
          components: components(true),
        });
      });
  },
};
