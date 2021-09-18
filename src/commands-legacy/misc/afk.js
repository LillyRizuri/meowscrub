const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");
const color = require("../../assets/json/colors.json");

const afkSchema = require("../../models/afk-schema");

module.exports = {
  aliases: ["afk", "idle"],
  memberName: "afk",
  group: "misc",
  description: "Set yourself an AFK status.",
  details:
    "If someone mention you while you were AFK, they would be greeted with a notice saying that you are away.",
  format: "[reason]",
  examples: ["afk coding time"],
  cooldown: 15,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let afkMessage = args;

    if (!afkMessage) afkMessage = "No reason provided.";

    if (afkMessage.length > 256)
      return message.reply(
        emoji.denyEmoji + " Keep your reason at under 256 characters."
      );

    const results = await afkSchema.findOne({
      guildId: message.guild.id,
      userId: message.author.id,
    });

    if (results) {
      await afkSchema.findOneAndDelete({
        guildId: message.guild.id,
        userId: message.author.id,
      });
      // eslint-disable-next-line no-empty
    } else if (!results) {
    }

    await afkSchema.findOneAndUpdate(
      {
        guildId: message.guild.id,
        userId: message.author.id,
      },
      {
        guildId: message.guild.id,
        userId: message.author.id,
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
            ? message.author.username
            : message.member.nickname
        }`
      )
      // eslint-disable-next-line no-empty-function
      .catch(() => {});

    const afkSetEmbed = new Discord.MessageEmbed()
      .setColor(color.green)
      .setDescription(
        emoji.successEmoji + ` **${message.author.tag}'s AFK status has been set.**\n\`${afkMessage}\``
      )
      .setFooter("other members, don't disturb")
      .setTimestamp();

    message.channel.send({ embeds: [afkSetEmbed] });
  },
};
