const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");
const humanizeDuration = require("humanize-duration");

const economy = require("../../economy");
const cooldowns = new Map();

const locations = require("../../assets/js/locations");

module.exports = class WorkCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "scout",
      group: "economy",
      memberName: "scout",
      description: "Find money in 3 random places.",
      guildOnly: true,
    });
  }
  async run(message) {
    const buttons = [];
    const cooldown = cooldowns.get(message.author.id);
    if (cooldown) {
      const remaining = humanizeDuration(cooldown - Date.now(), {
        round: true,
      });
      return message.reply(
        `You may not use the \`scout\` command again for another ${remaining}.`
      );
    }

    const chosenLocations = locations
      .sort(() => Math.random() - Math.random())
      .slice(0, 3);

    for (let i = 0; i < chosenLocations.length; i++) {
      const btn = new disbut.MessageButton()
        .setStyle("blurple")
        .setLabel(chosenLocations[i].name.toProperCase())
        .setID(chosenLocations[i].name);
      buttons.push(btn);
    }

    const row = new disbut.MessageActionRow().addComponents(buttons);

    const msg = await message.reply("Where would you like to search?", row);

    const filter = (button) => button.clicker.user.id === message.author.id;

    msg
      .awaitButtons(filter, { max: 1, time: 30000 })
      .then(async (collected) => {
        const selectedLocation = chosenLocations.find(
          (location) =>
            location.name.toLowerCase() === collected.first().id.toLowerCase()
        );

        for (let i = 0; i < buttons.length; i++) {
          if (
            collected.first().id.toLowerCase() ===
            buttons[i].custom_id.toLowerCase()
          ) {
            buttons[i].setDisabled();
          } else {
            buttons[i].setStyle("grey").setDisabled();
          }
        }

        const rowEdit = new disbut.MessageActionRow().addComponents(buttons);

        const rngCoins = Math.floor(Math.random() * selectedLocation.rngCoins + 100);
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
              await economy.addCoins(message.author.id, -currentCoins);
            } finally {
              await collected
                .first()
                .message.edit(
                  `You died at the \`${selectedLocation.name.toProperCase()}\`\n${response}`,
                  rowEdit
                );
            }
            break;
          }
          default: {
            try {
              await economy.addCoins(message.author.id, rngCoins);
              await economy.bankCapIncrease(message.author.id);
            } finally {
              await collected
                .first()
                .message.edit(
                  `You found **¢${rngCoins}** at the \`${selectedLocation.name.toProperCase()}\`\n${response}`,
                  rowEdit
                );
            }
            break;
          }
        }

        collected.first().reply.defer();
      })
      .catch(() => {
        message.reply(
          "<:scrubred:797476323169533963> What are you stalling for?"
        );
      });

    cooldowns.set(message.author.id, Date.now() + 30000);
    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, 30000);
  }
};
