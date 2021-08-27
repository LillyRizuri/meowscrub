const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["nuke"],
  memberName: "nuke",
  group: "moderation",
  description: "Clone and delete a specified channel. ISTG don't mess with it.",
  format: "[#channel | channelID]",
  examples: ["nuke #potato", "nuke"],
  clientPermissions: [
    "MANAGE_MESSAGES",
    "MANAGE_CHANNELS",
    "READ_MESSAGE_HISTORY",
    "EMBED_LINKS",
  ],
  userPermissions: [
    "MANAGE_MESSAGES",
    "MANAGE_CHANNELS",
    "READ_MESSAGE_HISTORY",
  ],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let channelToNuke;
    if (!args) {
      channelToNuke = message.channel;
    } else if (args) {
      channelToNuke =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args);
      if (!channelToNuke)
        return message.reply(
          emoji.denyEmoji +
            " THIS is not a valid channel. Put in the correct Channel ID."
        );
    }

    if (!channelToNuke.viewable)
      return message.reply(
        emoji.denyEmoji + " I can't view your specified channel."
      );

    const confirmationEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(
        `Initiated by ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      ).setDescription(`
You will attempt to nuke this channel: [${channelToNuke}]
**+ Please confirm by typing "CONFIRM" in all caps.**
**+ Type anything beside "CONFIRM" (in all caps) to cancel the operation.**
**+ Do this action at your own risk.**
      `);
    await message.reply({ embeds: [confirmationEmbed] });

    const filter = (m) => m.author === message.author;

    message.channel
      .awaitMessages({ filter, max: 1, time: 30000 })
      .then(async (collected) => {
        if (collected.first().content === "CONFIRM") {
          try {
            await message.channel.send(
              "Right. The timer for 5 seconds has been set for the nuke."
            );
          } finally {
            setTimeout(async () => {
              try {
                const newChannel = await channelToNuke.clone({
                  reason: `Operation done by ${message.author.tag}`,
                });

                await channelToNuke.delete();
                if (channelToNuke !== message.channel)
                  await message.channel.send(
                    emoji.successEmoji +
                      " **Successfully nuked the following channel.**"
                  );
                await newChannel.send(
                  emoji.successEmoji +
                    " **Successfully nuked the following channel.**"
                );
              } catch (err) {
                message.channel.send(
                  `An unexpected error occured. Maybe it's due to I don't have sufficient permission to delete/clone the target channel.\n\`${err}\``
                );
              }
            }, 5000);
          }
        } else {
          return message.channel.send("Operation canceled. Phew.");
        }
      })
      .catch(() => {
        message.channel.send(
          "No message confirmation after 30 seconds, operation canceled."
        );
      });
  },
};
