const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const settingsSchema = require("../../models/settings-schema");

const checkMark = "<:scrubgreenlarge:797816509967368213>";
const cross = "<:scrubredlarge:797816510579998730>";
const qstnMark = "<:scrubnulllarge:797816510298324992>";

module.exports = class SuggestCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "suggest",
      aliases: ["suggestion", "idea"],
      group: "misc",
      memberName: "suggest",
      description: "Suggest an idea to forward it into a suggestion channel.",
      argsType: "single",
      format: "<string>",
      examples: [
        "suggest frockles should probably do something for the whole server. it's dying.",
      ],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const guildId = message.guild.id;
    const input = args;

    const results = await settingsSchema.findOne({
      guildId,
    });

    const channel = message.guild.channels.cache.get(
      results.settings.suggestionChannel
    );

    if (!channel)
      return message.reply(
        "<:scrubnull:797476323533783050> This server doesn't have any suggestion channel set up. Sorry."
      );

    if (!input)
      return message.reply(
        "<:scrubnull:797476323533783050> You need to suggest something before you advance."
      );

    if (input.length > 1024)
      return message.reply(
        "<:scrubred:797476323169533963> Your suggestion musn't have more than 1024 characters."
      );

    const embed = new Discord.MessageEmbed()
      .setColor("#ff0000")
      .setAuthor(
        message.author.tag,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setDescription(input)
      .setFooter(`UserID: ${message.author.id}`)
      .setTimestamp();
    channel.send(embed).then((msg) => {
      message.reply(
        `<:scrubgreen:797476323316465676> Successfully recorded your suggestion into ${channel}. That's nice.`
      );

      msg.react(checkMark);
      setTimeout(() => {
        msg.react(cross);
      }, 750);
      setTimeout(() => {
        msg.react(qstnMark);
      }, 750);
    });
  }
};
