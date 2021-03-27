const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { red, what, green } = require("../../assets/json/colors.json");

module.exports = class RerollGiveawayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "greroll",
      group: "giveaway",
      memberName: "greroll",
      description: "Reroll a selected giveaway.",
      argsType: "single",
      format: "<messageID>",
      examples: ["greroll 812294604249628692"],
      userPermissions: ["MANAGE_MESSAGES"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    const messageID = args;

    if (!messageID) {
      const notEnoughEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> A message ID of a giveaway is required."
        )
        .setFooter("enable dev mode")
        .setTimestamp();
      message.reply(notEnoughEmbed);
      return;
    }

    this.client.giveawaysManager
      .reroll(messageID, {
        messages: {
          congrat: "New winner(s): {winners}! Congratulations!\n{messageURL}",
          error: "No valid participations entry, so no winners can be chosen.",
        },
      })
      .then(() => {
        const confirmEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `<:scrubgreen:797476323316465676> Rerolled a giveaway with this message ID: \`${messageID}\`.`
          )
          .setFooter("see what we got here?")
          .setTimestamp();
        message.reply(confirmEmbed);
      })
      .catch((err) => {
        const errorEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            `<:scrubred:797476323169533963> There's no giveaway with this message ID: \`${messageID}\`.`
          )
          .setFooter("the hell are you doing")
          .setTimestamp();
        message.reply(errorEmbed);
      });
  }
};
