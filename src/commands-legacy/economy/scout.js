const Discord = require("discord.js");

const economy = require("../../util/economy");

const locations = require("../../assets/js/locations");

module.exports = {
  aliases: ["scout"],
  memberName: "scout",
  group: "economy",
  description: "Find money in 3 random places.",
  details: "You risk losing all of your money while searching, so be careful.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 30,
  guildOnly: true,
  callback: async (client, message) => {
    const buttons = [];

    const chosenLocations = locations
      .sort(() => Math.random() - Math.random())
      .slice(0, 3);

    for (let i = 0; i < chosenLocations.length; i++) {
      const btn = new Discord.MessageButton()
        .setStyle("PRIMARY")
        .setLabel(chosenLocations[i].name.toProperCase())
        .setCustomId(chosenLocations[i].name);
      buttons.push(btn);
    }

    const row = new Discord.MessageActionRow().addComponents(buttons);

    const msg = await message.reply({
      content: "Where would you like to search?",
      components: [row],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    msg
      .awaitMessageComponent({ filter, time: 30000, componentType: "BUTTON" })
      .then(async (interaction) => {
        const selectedLocation = chosenLocations.find(
          (location) =>
            location.name.toLowerCase() === interaction.customId.toLowerCase()
        );

        for (let i = 0; i < row.components.length; i++) {
          if (
            interaction.customId.toLowerCase() ===
            row.components[i].customId.toLowerCase()
          ) {
            row.components[i].setDisabled();
          } else {
            row.components[i].setStyle("SECONDARY").setDisabled();
          }
        }

        const rngCoins = Math.floor(
          Math.random() * selectedLocation.rngCoins + 100
        );
        let randomNumber = 1;

        if (selectedLocation.chosenNumber) {
          randomNumber = Math.floor(
            Math.random() * selectedLocation.chosenNumber
          );
        }

        let response = selectedLocation.successResponse;

        switch (randomNumber) {
          // 0 = death, any number beside 0 is safe
          case 0: {
            response = selectedLocation.failResponse;
            const currentCoins = await economy.getCoins(message.author.id);

            try {
              await economy.addCoins(message.author.id, currentCoins * -1);
            } finally {
              await interaction.message.edit({
                content: `You died at the \`${selectedLocation.name.toProperCase()}\`\n${response}`,
                components: [row],
              });
            }
            break;
          }
          default: {
            try {
              await economy.addCoins(message.author.id, rngCoins);
              await economy.bankCapIncrease(message.author.id);
            } finally {
              await interaction.message.edit({
                content: `You found **¢${rngCoins}** at the \`${selectedLocation.name.toProperCase()}\`\n${response}`,
                components: [row],
              });
            }
            break;
          }
        }

        await interaction.deferUpdate();
      })
      .catch(() => {
        message.reply(
          `${message.author.toString()}, What are you stalling for?`
        );
      });
  },
};
