const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { PaginatedEmbed } = require("embed-paginator");

const warnSchema = require("../../models/warn-schema");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class WarningsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "warnings",
      aliases: ["listwarn", "listwarnings", "warns"],
      group: "moderation",
      memberName: "warnings",
      description: "Check the warn list of somebody.",
      argsType: "single",
      format: "<@user>",
      examples: ["warnings @frockles"],
      clientPermissions: ["EMBED_LINKS", "ADD_REACTIONS", "MANAGE_MESSAGES"],
      userPermissions: ["BAN_MEMBERS"],
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

    let output = "";

    try {
      for (const warning of results.warnings) {
        const { author, authorId, timestamp, warnId, reason } = warning;

        const formattedTimestamp = new Date(timestamp).toLocaleDateString(
          "en-US",
          dateTimeOptions
        );

        output += `\`${warnId}: ${formattedTimestamp}\` - By **${author}** (${authorId})\n**Reason:** ${reason}\n\n`;
      }
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> There's no warnings for that user."
      );
    }

    if (!output)
      return message.reply(
        "<:scrubred:797476323169533963> There's no warnings for that user."
      );

    const splitOutput = Discord.Util.splitMessage(output, {
      maxLength: 1024,
      char: "\n\n",
      prepend: "",
      append: "",
    });

    const warnlistEmbed = new PaginatedEmbed({
      colours: [embedcolor],
      descriptions: splitOutput,
      duration: 60 * 1000,
      paginationType: "description",
      itemsPerPage: 1,
    })
      .setAuthor(`Previous warnings for ${userTag} (${userId})`, userAvatar)
      .setTitle(`${results.warnings.length} warn(s) in total`)
      .setTimestamp();

    warnlistEmbed.send(message.channel);
  }
};
