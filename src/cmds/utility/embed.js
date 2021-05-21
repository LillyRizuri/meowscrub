const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { what } = require("../../assets/json/colors.json");

module.exports = class EmbedCreatorCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "embed",
      aliases: ["em"],
      group: "utility",
      memberName: "embed",
      description: "Just a really simple embed maker.",
      argsType: "multiple",
      format: "<title> <color> <description>",
      examples: [
        "embed Hello #7289da This is a test.",
        "embed Hello GREEN This is a test.",
      ],
      userPermissions: ["MANAGE_MESSAGES"],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message, args) {
    const title = args[0];
    const color = args[1];
    const description = args.slice(2).join(" ");

    if (!title || !color || !description) {
      const errorEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setTitle("Invalid Arguments Identified.")
        .setDescription(
          `
Proper Arguments:
**+ Title (One Word Only)**
**+ Color (Color Hex / Basic Color in All Caps)**
**+ Description (Embed Body)**
`
        );
      message.reply(errorEmbed);
      return;
    }

    const properEmbed = new Discord.MessageEmbed()
      .setTitle(title)
      .setColor(color)
      .setDescription(description)
      .setFooter(`Embed created by: ${message.author.username}`);
    message.channel.send(properEmbed);
  }
};
