const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green, red } = require("../../assets/json/colors.json");

const mongo = require("../../mongo");
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
      guildOnly: true,
    });
  }

  async run(message, args) {
    let afkMessage = args;
    let userId = message.author.id;
    let guildId = message.guild.id;

    if (!afkMessage) {
      afkMessage = "No reason provided.";
    }

    if (afkMessage.length > 256) {
      const tooMuchEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> The reason is way beyond limit of 256 characters."
        )
        .setFooter("try again")
        .setTimestamp();
      return message.reply(tooMuchEmbed);
    }

    const results = await afkSchema.find({
      guildId,
    });

    for (let i = 0; i < results.length; i++) {
      const { userId } = results[i];

      if (message.author.id === userId) {
        await afkSchema.findOneAndDelete({
          guildId,
          userId,
        });
      }
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
      .catch((err) => {});
    const afkSetEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> **${message.author.tag}'s AFK status has been set.**\n\`${afkMessage}\``
      )
      .setFooter("other members, don't disturb")
      .setTimestamp()
    message.channel.send(afkSetEmbed)
  }
};
