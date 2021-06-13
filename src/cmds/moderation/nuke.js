const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green, embedcolor } = require("../../assets/json/colors.json");

module.exports = class NukeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "nuke",
      group: "moderation",
      memberName: "nuke",
      description: "Clone and delete a specified channel.",
      details:
        "Leaving the channel field blank will target the channel the command was ran on.",
      format: "[#channel/channelID]",
      examples: ["nuke #potato", "nuke"],
      argsType: "single",
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
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    let channelToNuke;
    if (!args) {
      channelToNuke = message.channel;
    } else if (args) {
      channelToNuke =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args);
      if (!channelToNuke)
        return message.reply(
          "<:scrubred:797476323169533963> THIS is not a valid channel. Put in the correct Channel ID."
        );
    }

    const confirmationEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(
        `Initiated by ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      ).setDescription(`
You will attempt to nuke this channel: [${channelToNuke}]
**+ Please confirm by typing "CONFIRM" in all caps.**
**+ Type anything beside "CONFIRM" (in all caps) to cancel the operation.**
**+ Do this action at your own risk.**
      `);
    await message.reply(confirmationEmbed);

    const filter = (m) => m.author === message.author;

    message.channel
      .awaitMessages(filter, { max: 1, time: 30000 })
      .then(async (collected) => {
        if (collected.first().content === "CONFIRM") {
          try {
            await message.channel.send(
              "Right. The timer for 10 seconds has been set for the nuke."
            );
          } finally {
            setTimeout(async () => {
              try {
                const newChannel = await channelToNuke.clone({
                  reason: `Operation done by ${message.author.tag}`,
                });

                await channelToNuke.delete();
                const nukeCompleteEmbed = new Discord.MessageEmbed()
                  .setColor(green)
                  .setDescription(
                    "<:scrubgreen:797476323316465676> **Successfully nuked the following channel.**"
                  )
                  .setFooter("what do you want me to do?")
                  .setTimestamp();
                if (channelToNuke !== message.channel)
                  await message.channel.send(nukeCompleteEmbed);
                await newChannel.send(nukeCompleteEmbed);
              } catch (err) {
                message.channel.send(
                  `An unexpected error occured. Maybe it's due to I don't have sufficient permission to delete/clone the target channel.\n\`${err}\``
                );
              }
            }, 10000);
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
    // await msg.react(checkMark);
    // await msg.react(cross);

    // const filter = (reaction, user) =>
    //   user.id == message.author.id &&
    //   (reaction.emoji.name == "scrubgreenlarge" ||
    //     reaction.emoji.name == "scrubredlarge");

    // msg
    //   .awaitReactions(filter, { max: 1, time: 30000 })
    //   .then(async (reactionCollected) => {
    //     if (reactionCollected.first().emoji.name == "scrubgreenlarge") {
    //       try {
    //         await message.channel.send(
    //           "Right. The timer for 10 seconds has been set for the nuke."
    //         );
    //       } finally {
    //         setTimeout(async () => {
    //           const newChannel = await channelToNuke.clone({
    //             reason: `Operation done by ${message.author.tag}`,
    //           });

    //           await channelToNuke.delete();
    //           const nukeCompleteEmbed = new Discord.MessageEmbed()
    //             .setColor(green)
    //             .setDescription(
    //               "<:scrubgreen:797476323316465676> **Successfully nuked the following channel.**"
    //             )
    //             .setFooter("what do you want me to do?")
    //             .setTimestamp();
    //           if (channelToNuke !== message.channel)
    //             await message.channel.send(nukeCompleteEmbed);
    //           await newChannel.send(nukeCompleteEmbed);
    //         }, 10000);
    //       }
    //     } else message.channel.send("Operation canceled. Phew.");
    //   })
    //   .catch(() => {
    //     message.channel.send(
    //       "No reaction after 30 seconds, operation canceled."
    //     );
    //   });
  }
};
