const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");

const afkSchema = require("../../models/afk-schema");

module.exports = class AFKCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "afk",
      aliases: ["idle"],
      group: "misc",
      memberName: "afk",
      description: "Set yourself an AFK status.",
      argsType: "single",
      format: "[reason]",
      examples: ["afk coding time"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 30,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    let afkMessage = args;
    const userId = message.author.id;
    const guildId = message.guild.id;

    if (!afkMessage) {
      afkMessage = "No reason provided.";
    }

    if (afkMessage.length > 256)
      return message.reply(
        "<:scrubred:797476323169533963> The reason is way beyond limit of 256 characters."
      );

    const results = await afkSchema.findOne({
      guildId,
      userId: message.author.id,
    });

    if (results) {
      if (message.author.id === results.userId) {
        await afkSchema.findOneAndDelete({
          guildId,
          userId,
        });
      }
    // eslint-disable-next-line no-empty
    } else if (!results) {
    }

    await afkSchema.findOneAndUpdate(
      {
        guildId,
        userId,
      },
      {
        guildId,
        userId,
        $set: {
          afk: afkMessage,
          timestamp: new Date().getTime(),
          username:
            message.member.nickname === null
              ? message.author.username
              : message.member.nickname,
        },
      },
      {
        upsert: true,
        useFindAndModify: false,
      }
    );

    await message.member
      .setNickname(
        `[AFK] ${
          message.member.nickname === null
            ? `${message.author.username}`
            : `${message.member.nickname}`
        }`
      )
      // eslint-disable-next-line no-empty-function
      .catch(() => {});
    const afkSetEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> **${message.author.tag}'s AFK status has been set.**\n\`${afkMessage}\``
      )
      .setFooter("other members, don't disturb")
      .setTimestamp();
    message.channel.send(afkSetEmbed);
  }
};
