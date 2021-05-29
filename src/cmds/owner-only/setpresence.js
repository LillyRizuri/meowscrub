const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");

module.exports = class SetPresenceCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "set-presence",
      group: "owner-only",
      memberName: "set-presence",
      argsType: "single",
      format: "<activityName>",
      description: "Set my presence based on your provided argument.",
      details: "Only the bot owner(s) may use this command.",
      clientPermissions: ["EMBED_LINKS"],
      hidden: true
    });
  }

  async run(message, args) {
    if (!this.client.isOwner(message.author))
      return message.reply(
        "<:scrubred:797476323169533963> Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s)."
      );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> I can't set my presence without your provided argument. Try again."
      );

    try {
      this.client.user.setPresence({
        activity: {
          name: args,
          type: "WATCHING"
        },
      });
      const confirmationEmbed = new Discord.MessageEmbed()
        .setColor(green)
        .setDescription(
          `<:scrubgreen:797476323316465676> Successfullly changed my presence to:\n\`WATCHING ${args}\``
        )
        .setFooter("hmmm why that")
        .setTimestamp();
      message.reply(confirmationEmbed);
    } catch (err) {
      message.reply(`An unexpected error occured.\n${err}`);
    }
  }
};
