const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class SnipeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "snipe",
      group: "moderation",
      memberName: "snipe",
      description: "Reveals the latest deleted message.",
      details:
        "Leave the argument blank to check for the channel the command was run in.",
      argsType: "single",
      format: "[#channel/channelID]",
      examples: [
        "editsnipe #general",
        "editsnipe 750858623843827812",
        "editsnipe",
      ],
      userPermissions: ["MANAGE_MESSAGES"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  run(message, args) {
    const selectedChannel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args) ||
      message.channel;

    if (selectedChannel.nsfw === true)
      return message.reply(
        "<:scrubred:797476323169533963> Sniping in an NSFW channel is prohibited."
      );

    const snipe = this.client.snipe.get(selectedChannel.id);
    if (!snipe)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no latest deleted message."
      );

    const snipedEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(snipe.authorTag, snipe.avatar)
      .setFooter(`UserID: ${snipe.authorId}`)
      .setTimestamp(snipe.createdAt);
    if (snipe.attachments) {
      snipedEmbed
        .setImage(snipe.attachments)
        .setDescription(
          `${snipe.content}\n[\`Attachment\`](${snipe.attachments})`
        );
    } else {
      snipedEmbed.setDescription(snipe.content);
    }
    message.channel.send(snipedEmbed);
  }
};
