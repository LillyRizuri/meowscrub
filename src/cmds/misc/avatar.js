const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class AvatarCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "avatar",
      aliases: ["av", "pfp", "icon"],
      group: "misc",
      memberName: "avatar",
      description: "Return your/someone else's avatar.",
      argsType: "single",
      format: "[@user/userID]",
      examples: ["avatar", "avatar @frockles", "avatar 693832549943869493"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
    let target;
    try {
      if (!args) {
        target = message.author;
      } else if (args) {
        target =
          message.mentions.users.first() ||
          (await this.client.users.fetch(args));
      }
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?"
      );
    }

    const avatar = target.displayAvatarURL({
      format: "png",
      size: 4096,
      dynamic: true,
    });

    const avatarEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(`${target.tag}'s Profile Picture`)
      .setImage(avatar)
      .setFooter(
        `Requested by ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      );
    message.channel.send(avatarEmbed);
  }
};
