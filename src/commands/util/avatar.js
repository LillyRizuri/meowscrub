const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["avatar", "av", "pfp", "icon"],
  memberName: "avatar",
  group: "util",
  description: "Return your/someone else's avatar.",
  format: "[@user/userID]",
  examples: ["avatar", "avatar @frockles", "avatar 693832549943869493"],
  singleArgs: true,
  cooldown: 5,
  callback: async (client, message, args) => {
    let target;
    try {
      if (!args) {
        target = message.author;
      } else if (args) {
        target =
          message.mentions.users.first() || (await client.users.fetch(args));
      }
    } catch (err) {
      return message.reply(
        emoji.denyEmoji +
          " What are you trying to do with that invalid user ID?"
      );
    }

    const avatar = target.displayAvatarURL({
      format: "png",
      size: 4096,
      dynamic: true,
    });

    const avatarEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(`${target.tag}'s Profile Picture`)
      .setImage(avatar)
      .setFooter(
        `Requested by ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      );

    message.channel.send({ embeds: [avatarEmbed] });
  },
};
