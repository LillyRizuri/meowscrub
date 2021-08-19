const Discord = require("discord.js");
const { parse } = require("twemoji-parser");

const economySchema = require("../../models/economy-schema");

const economy = require("../../util/economy");

const shopItems = require("../../assets/js/item");
const memeType = require("../../assets/js/meme-type");
const emoji = require("../../assets/json/tick-emoji.json");
const { what, red, green } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["postmeme", "pm"],
  memberName: "postmeme",
  group: "economy",
  description: "Post a random meme! (requires a laptop)",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 30,
  guildOnly: true,
  callback: async (client, message) => {
    const buttons = [];

    const results = await economySchema.findOne({
      userId: message.author.id,
    });

    if (
      !results ||
      !results.inventory.some((i) => i.name.toLowerCase() === "laptop")
    )
      return message.reply(
        emoji.denyEmoji +
          " You don't have a `laptop`. Please go to the store and buy one."
      );

    function item(itemName) {
      return shopItems.find(
        (value) => value.name.toLowerCase() === itemName.toLowerCase()
      );
    }

    for (let i = 0; i < memeType.length; i++) {
      const btn = new Discord.MessageButton()
        .setStyle("PRIMARY")
        .setLabel(memeType[i].name.toProperCase())
        .setCustomId(memeType[i].name);
      buttons.push(btn);
    }

    const row = new Discord.MessageActionRow().addComponents(buttons);

    let laptopEmoji = "";

    const parsedEmoji = Discord.Util.parseEmoji(item("laptop").emoji);
    if (parsedEmoji.id) {
      const extension = parsedEmoji.animated ? ".gif" : ".png";
      laptopEmoji = `https://cdn.discordapp.com/emojis/${
        parsedEmoji.id + extension
      }`;
    } else {
      const parsed = parse(item.emoji, { assetType: "png" });
      laptopEmoji = parsed[0].url;
    }

    const chooseMemeEmbed = new Discord.MessageEmbed()
      .setColor(what)
      .setTitle(`${message.author.username}'s meme posting attempt`)
      .setThumbnail(laptopEmoji)
      .setDescription(
        "**What type of meme do you want to post?**\n**Choose wisely.**"
      )
      .setFooter("waiting...")
      .setTimestamp();

    const msg = await message.channel.send({
      embeds: [chooseMemeEmbed],
      components: [row],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    msg
      .awaitMessageComponent({ filter, time: 30000, componentType: "BUTTON" })
      .then(async (interaction) => {
        const chosenMeme = memeType.find(
          (meme) =>
            meme.name.toLowerCase() === interaction.customId.toLowerCase()
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

        let rngCoins = Math.floor(Math.random() * chosenMeme.rngCoins + 100);

        const randomNumber = Math.floor(
          Math.random() * chosenMeme.chosenNumber
        );

        switch (randomNumber) {
          case 0: {
            const determineLaptopBreak = Math.floor(Math.random() * 5);
            chooseMemeEmbed.setColor(red).setFooter("too bad");
            switch (determineLaptopBreak) {
              case 0:
                await economy.removeItem(message.author.id, "laptop", 1);
                chooseMemeEmbed.setDescription(
                  `Everyone hates your meme (because your meme is cringe/unfunny).\n\nYou got \`¢0\`, AND your ${
                    item("laptop").emoji
                  } **${item(
                    "laptop"
                  ).name.toProperCase()}** is broken due to overwhelming hate.`
                );
                break;
              default:
                chooseMemeEmbed.setDescription(
                  "Everyone hates your meme (because your meme is cringe/unfunny).\n\nYou got `¢0`, the end."
                );
                break;
            }
            break;
          }
          default: {
            const determineTrending = Math.floor(Math.random() * 5);
            chooseMemeEmbed.setColor(green);
            switch (determineTrending) {
              case 0:
                rngCoins = Math.floor(
                  Math.random() * (chosenMeme.rngCoins * 4) + 100
                );
                await economy.addCoins(message.author.id, rngCoins);
                chooseMemeEmbed
                  .setDescription(
                    `Your meme is on TRENDING!\n\nYou earned\`¢${rngCoins.toLocaleString()}\` from your efforts.`
                  )
                  .setFooter("what a gamble");
                break;
              default:
                await economy.addCoins(message.author.id, rngCoins);
                chooseMemeEmbed
                  .setColor(green)
                  .setDescription(
                    `Your meme got a decent response online!\n\nYou earned\`¢${rngCoins.toLocaleString()}\` from your efforts.`
                  )
                  .setFooter("nice, hopefully you will have more luck");
                break;
            }
            await economy.bankCapIncrease(message.author.id);
            break;
          }
        }

        await interaction.message.edit({
          embeds: [chooseMemeEmbed],
          components: [row],
        });
        interaction.deferUpdate();
      })
      .catch(() => {
        message.reply(
          `${message.author.toString()}, What are you stalling for?`
        );
      });
  },
};
