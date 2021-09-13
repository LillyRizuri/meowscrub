const economySchema = require("../../models/economy-schema");

const economy = require("../../util/economy");

const shopItems = require("../../assets/js/item");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["fish"],
  memberName: "fish",
  group: "economy",
  description: "Go fishing!",
  cooldown: 30,
  guildOnly: true,
  callback: async (client, message) => {
    const results = await economySchema.findOne({
      userId: message.author.id,
    });

    if (
      !results ||
      !results.inventory.some((i) => i.name.toLowerCase() === "fishingrod")
    )
      return message.reply(
        emoji.denyEmoji +
          " You don't have a `fishingrod`. Please go to the store and buy one."
      );

    function item(itemName) {
      return shopItems.find(
        (value) => value.name.toLowerCase() === itemName.toLowerCase()
      );
    }

    const randomNumber = Math.floor(Math.random() * 5);

    switch (randomNumber) {
      case 0:
        message.reply(
          item("fishingrod").emoji +
            " Hours of fishing and you didn't catch any? Great."
        );
        break;
      default: {
        const numberOfFish = Math.floor(Math.random() * 4) + 1;
        await economy.addItem(message.author.id, "fish", numberOfFish);
        message.reply(
          item("fishingrod").emoji +
            ` You brought back ${numberOfFish} fish(es) after hours of fishing!`
        );
        await economy.bankCapIncrease(message.author.id);
        break;
      }
    }
  },
};
