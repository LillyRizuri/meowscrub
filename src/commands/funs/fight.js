const { Fight } = require("weky");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["fight", "battle"],
  memberName: "fight",
  group: "funs",
  description: "Fight to begone.",
  format: "<@user>",
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message) => {
    const target = message.mentions.users.first();

    if (!target)
      return message.reply(
        emoji.missingEmoji + " Please request an user to fight."
      );

    if (target.bot === true)
      return message.reply(
        emoji.denyEmoji + " You cannot fight with bots. That's stupid."
      );

    if (target === message.author)
      return message.reply(
        emoji.denyEmoji + " Are you trying to fight yourself? Seriously?"
      );

    Fight({
      message: message,
      opponent: message.mentions.users.first(),
      embed: {
        title: "Fight!!!!!!",
        color: "#7289da",
        timestamp: true,
      },
      buttons: {
        hit: "Attack",
        heal: "Heal",
        cancel: "Retreat",
        accept: "Accept",
        deny: "Deny",
      },
      acceptMessage:
        "<@{{challenger}}> has challenged <@{{opponent}}> for a fight!",
      winMessage: "GG, <@{{winner}}> won the fight!",
      endMessage:
        "<@{{opponent}}> didn't answer in time. Game cancelled.",
      cancelMessage: "<@{{opponent}}> refused to have a fight with you!",
      fightMessage: "{{player}} you go first!",
      opponentsTurnMessage: "Please wait for your opponents move!",
      highHealthMessage: "You cannot heal if your HP is above 80!",
      lowHealthMessage: "You cannot cancel the fight if your HP is below 50!",
      returnWinner: false,
      othersMessage: "Only {{author}} can use the buttons!",
    });
  },
};
