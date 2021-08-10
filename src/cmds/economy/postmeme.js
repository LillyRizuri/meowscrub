const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { parse } = require("twemoji-parser");
const disbut = require("discord-buttons");
const humanizeDuration = require("humanize-duration");

const economySchema = require("../../models/economy-schema");

const economy = require("../../economy");
const cooldowns = new Map();

const shopItems = require("../../assets/js/item");
const memeType = require("../../assets/js/meme-type");
const { what, red, green } = require("../../assets/json/colors.json");

module.exports = class PostMemeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "postmeme",
      group: "economy",
      aliases: ["pm"],
      memberName: "postmeme",
      description: "Post a random meme! (requires a laptop)",
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
        `You may not use the \`postmeme\` command again for another ${remaining}.`
      );
    }

    const results = await economySchema.findOne({
      userId: message.author.id,
    });

    if (!results || !results.inventory.some((i) => i.name.toLowerCase() === "laptop"))
      return message.reply(
        "<:scrubred:797476323169533963> You don't have a `laptop`. Please go to the store and buy one."
      );

    function item(itemName) {
      return shopItems.find(
        (value) => value.name.toLowerCase() === itemName.toLowerCase()
      );
    }

    for (let i = 0; i < memeType.length; i++) {
      const btn = new disbut.MessageButton()
        .setStyle("blurple")
        .setLabel(memeType[i].name.toProperCase())
        .setID(memeType[i].name);
      buttons.push(btn);
    }

    const row = new disbut.MessageActionRow().addComponents(buttons);

    let emoji = "";

    const parsedEmoji = Discord.Util.parseEmoji(item("laptop").emoji);
    if (parsedEmoji.id) {
      const extension = parsedEmoji.animated ? ".gif" : ".png";
      emoji = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`;
    } else {
      const parsed = parse(item.emoji, { assetType: "png" });
      emoji = parsed[0].url;
    }

    const chooseMemeEmbed = new Discord.MessageEmbed()
      .setColor(what)
      .setTitle(`${message.author.username}'s meme posting attempt`)
      .setThumbnail(emoji)
      .setDescription(
        "**What type of meme do you want to post?**\n**Choose wisely.**"
      )
      .setFooter("waiting...")
      .setTimestamp();

    const msg = await message.channel.send({
      embed: chooseMemeEmbed,
      component: row,
    });

    const filter = (button) => button.clicker.user.id === message.author.id;

    msg
      .awaitButtons(filter, { max: 1, time: 30000 })
      .then(async (collected) => {
        const chosenMeme = memeType.find(
          (meme) =>
            meme.name.toLowerCase() === collected.first().id.toLowerCase()
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
                  } **${item("laptop").name.toProperCase()}** is broken due to overwhelming hate.`
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

        await collected.first().message.edit({
          embed: chooseMemeEmbed,
          component: rowEdit,
        });
        collected.first().reply.defer();
      });

    cooldowns.set(message.author.id, Date.now() + 30000);
    setTimeout(() => {
      cooldowns.delete(message.author.id);
    }, 30000);
  }
};
