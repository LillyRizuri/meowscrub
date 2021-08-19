const Discord = require("discord.js");

const { green, red, what } = require("../../assets/json/colors.json");

const economy = require("../../util/economy");

module.exports = {
  aliases: ["highlow"],
  memberName: "highlow",
  group: "economy",
  description:
    "Guess if the actual number is higher or lower than the first provided number.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 30,
  guildOnly: true,
  callback: async (client, message) => {
    function between(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    const actualNumber = between(20, 85);
    const hintedNumber = actualNumber + plusOrMinus * Math.floor((Math.random() * 15));

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setStyle("PRIMARY")
        .setCustomId("low")
        .setLabel("Low"),
      new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setCustomId("jackpot")
        .setLabel("JACKPOT!"),
      new Discord.MessageButton()
        .setStyle("PRIMARY")
        .setCustomId("high")
        .setLabel("High")
    );

    const readyEmbed = new Discord.MessageEmbed()
      .setColor(what)
      .setAuthor(
        `${message.author.username}'s high-low game`,
        message.author.displayAvatarURL()
      )
      .setDescription(
        `
The actual number between 1-100 has been chosen. Your hint is **${hintedNumber}**.
Respond using the buttons below.
`
      )
      .setFooter(
        "choose whether you think the secret number is higher, lower, or the same as the hinted number"
      );
    const messageConfirmation = await message.channel.send({
      embeds: [readyEmbed],
      components: [row],
    });

    const preppedMoney = between(200, 2500);

    const passedResponse = new Discord.MessageEmbed()
      .setColor(green)
      .setAuthor(
        `${message.author.username}'s winning of a high-low game`,
        message.author.displayAvatarURL()
      )
      .setDescription(
        `
**You won ¢${preppedMoney.toLocaleString()}!**
The hint was **${hintedNumber}**, and the actual number was **${actualNumber}**.
              `
      )
      .setFooter("kudos to you");

    const failedResponse = new Discord.MessageEmbed()
      .setColor(red)
      .setAuthor(
        `${message.author.username}'s loss of a high-low game`,
        message.author.displayAvatarURL()
      )
      .setDescription(
        `
**You lose!**
The hint was **${hintedNumber}**, and the actual number was **${actualNumber}**.
      `
      )
      .setFooter("well, idk what to say");

    const filter = (interaction) => interaction.user.id === message.author.id;
    messageConfirmation
      .awaitMessageComponent({ filter, time: 30000, componentType: "BUTTON" })
      .then(async (interaction) => {
        let pass = Boolean;
        for (let i = 0; i < row.components.length; i++) {
          if (
            interaction.customId.toLowerCase() === row.components[i].customId.toLowerCase()
          ) {
            row.components[i].setDisabled();
          } else {
            row.components[i].setStyle("SECONDARY").setDisabled();
          }
        }
        switch (interaction.customId) {
          case "high":
            if (actualNumber > hintedNumber) pass = true;
            else pass = false;
            break;
          case "low":
            if (actualNumber < hintedNumber) pass = true;
            else pass = false;
            break;
          case "jackpot":
            if (actualNumber === hintedNumber) pass = true;
            else pass = false;
            break;
        }

        if (pass) {
          await economy.addCoins(message.author.id, preppedMoney);
          await economy.bankCapIncrease(message.author.id);
          await interaction.message.edit({
            embeds: [passedResponse],
            components: [row],
          });
        } else {
          await interaction.message.edit({
            embeds: [failedResponse],
            components: [row],
          });
        }

        await interaction.deferUpdate();
      })
      .catch(() => {
        message.channel.send(
          `${message.author.toString()} Stalling for time is not a good idea.`
        );
      });
  },
};
