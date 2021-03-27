const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const ms = require("ms");

const { red, what, green } = require("../../assets/json/colors.json");

module.exports = class EditGiveawayCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "gedit",
      aliases: ["gmodify"],
      group: "giveaway",
      memberName: "gedit",
      description: "Edit a pre-existing giveaway.",
      argsType: "multiple",
      format: "<messageID> <newDuration> <newWinners> <newName>",
      examples: ["gedit 812294604249628692 1h 3 A Nintendo Switch"],
      userPermissions: ["MANAGE_MESSAGES"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    const messageID = args[0];
    const giveawayDuration = args[1];
    const giveawayWinners = Number(args[2]);
    const giveawayPrize = args.slice(3).join(" ");

    if (args.length < 4) {
      const notEnoughEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> You didn't provide all of the arguments."
        )
        .setFooter(
          `example: ${message.guild.commandPrefix}gedit 812294604249628692 30m 5 Awesome T-Shirt`
        )
        .setTimestamp();
      message.reply(notEnoughEmbed);
      return;
    }

    if (ms(giveawayDuration) < 10000 || ms(giveawayDuration) > 1209600000) {
      const invalidDurEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> The duration mustn't be less than 10 seconds and more than 2 weeks."
        )
        .setFooter("mind trying again?")
        .setTimestamp();
      message.reply(invalidDurEmbed);
      return;
    }

    if (
      giveawayWinners < 1 ||
      giveawayWinners > 20 ||
      !Number.isInteger(giveawayWinners)
    ) {
      const invalidWinnersEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          "<:scrubred:797476323169533963> There should be only at least 1 winner and no more than 20."
        )
        .setFooter("mind trying again?")
        .setTimestamp();
      message.reply(invalidWinnersEmbed);
      return;
    }

    this.client.giveawaysManager
      .edit(messageID, {
        newWinnerCount: giveawayWinners,
        newPrize: giveawayPrize,
        addTime: ms(giveawayDuration),
      })
      .then(() => {
        const confirmEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `<:scrubgreen:797476323316465676> Edited all properties for this giveaway ID: \`${messageID}\`.`
          )
          .setFooter("good luck... again?")
          .setTimestamp();
        message.reply(confirmEmbed);
      })
      .catch((err) => {
        const errorEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            `<:scrubred:797476323169533963> Absolutely no ongoing giveaways match with \`${messageID}\`.`
          )
          .setFooter("can you maybe chill")
          .setTimestamp();
        message.reply(errorEmbed);
      });
  }
};
