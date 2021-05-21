const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class EditSnipeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "editsnipe",
      group: "moderation",
      memberName: "editsnipe",
      description: "Reveals the latest before-edited message.",
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
        "<:scrubred:797476323169533963> Editsniping in an NSFW channel is prohibited."
      );

    const editsnipe = this.client.editsnipe.get(selectedChannel.id);
    if (!editsnipe)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no latest edited message."
      );

    const editSnipedEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(editsnipe.authorTag, editsnipe.avatar)
      .setFooter(`UserID: ${editsnipe.authorId}`)
      .setTimestamp(editsnipe.createdAt);
    if (editsnipe.attachments) {
      editSnipedEmbed
        .setImage(editsnipe.attachments)
        .setDescription(
          `${editsnipe.content}\n[\`Attachment\`](${editsnipe.attachments}) | [\`Referred Message\`](${editsnipe.url})\``
        );
    } else {
      editSnipedEmbed.setDescription(
        `${editsnipe.content}\n[\`Referred Message\`](${editsnipe.url})`
      );
    }
    message.channel.send(editSnipedEmbed);
  }
};
