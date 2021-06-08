const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const warnSchema = require("../../models/warn-schema");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class WarningsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "warnings",
      aliases: ["listwarn", "listwarnings"],
      group: "moderation",
      memberName: "warnings",
      description: "Check the warn list of somebody.",
      argsType: "single",
      format: "<@user>",
      examples: ["warnings @frockles"],
      clientPermissions: ["EMBED_LINKS"],
      userPermissions: ["MANAGE_GUILD"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const dateTimeOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> No specified user for listing strikes."
      );

    let target;
    try {
      target =
        message.mentions.users.first() || (await this.client.users.fetch(args));
    } catch (err) {
      console.log(err);
      return message.reply(
        "<:scrubred:797476323169533963> THAT'S not a valid user."
      );
    }

    const guildId = message.guild.id;
    const userTag = target.tag;
    const userAvatar = target.displayAvatarURL({ dynamic: true });
    const userId = target.id;

    const results = await warnSchema.findOne({
      guildId,
      userId,
    });

    let reply = "";

    try {
      for (const warning of results.warnings) {
        const { author, timestamp, warnId, reason } = warning;

        reply += `+ **ID: ${warnId} | ${author}**\n"${reason}" - ${new Date(
          timestamp
        ).toLocaleDateString("en-US", dateTimeOptions)}\n\n`;
      }
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> There's no warnings for that user."
      );
    }

    if (!reply)
      return message.reply(
        "<:scrubred:797476323169533963> There's no warnings for that user."
      );

    const warnlistEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(`Previous warnings for ${userTag}`, userAvatar)
      .setDescription(reply)
      .setFooter("wow")
      .setTimestamp();
    message.channel.send(warnlistEmbed);
  }
};
