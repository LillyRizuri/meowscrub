const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const warnSchema = require("../../models/warn-schema");

const { green } = require("../../assets/json/colors.json");

module.exports = class DeleteWarnCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "delwarn",
      aliases: ["rmstrike", "pardon"],
      group: "moderation",
      memberName: "delwarn",
      description: "Delete a warn using their Warn ID.",
      argsType: "multiple",
      format: "<@user> <WarnID>",
      examples: ["delwarn @frockles _g7tfhtshw"],
      clientPermissions: ["EMBED_LINKS"],
      userPermissions: ["BAN_MEMBERS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> At least provide at least one user to delete a warn for."
      );

    let target;

    try {
      target =
        message.mentions.users.first() ||
        (await this.client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> THAT'S not a valid user."
      );
    }

    const guildId = message.guild.id;
    const userId = target.id;

    if (!args[1])
      return message.reply(
        `<:scrubnull:797476323533783050> You need a Warn ID assigned for **${target.tag}**.`
      );

    const results = await warnSchema.findOne({
      guildId,
      userId,
    });

    for (const warning of results.warnings) {
      const { warnId } = warning;
      if (args[1] === warnId) {
        await warnSchema.findOneAndUpdate({
          guildId,
          userId,
        }, {
          guildId,
          userId,
          $pull: {
            warnings: {
              warnId,
            },
          },
        });

        const confirmationEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `<:scrubgreen:797476323316465676> Deleted a warn with this ID:\n**\`${warnId}\` for ${target.tag}.**`
          )
          .setFooter("is this fine?")
          .setTimestamp();
        return message.channel.send(confirmationEmbed);
      } else {
        return message.reply(
          `<:scrubred:797476323169533963> This Warn ID isn't a valid ID assigned for ${target.tag}.`
        );
      }
    }
  }
};
