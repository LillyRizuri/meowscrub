const Discord = require("discord.js");
const { pagination } = require("reconlx");

const util = require("../../util/util");

const economySchema = require("../../models/economy-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const shopItems = require("../../assets/js/item");

module.exports = {
  aliases: ["inventory", "inv"],
  memberName: "inventory",
  group: "economy",
  description: "Check your/someone else's inventory of items.",
  format: "[@user | userID]",
  examples: [
    "inventory",
    "inventory @frockles",
    "inventory 693832549943869493",
  ],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let target;
    try {
      if (!args) {
        target = message.author;
      } else if (args) {
        target =
          message.mentions.users.first() ||
          message.guild.members.cache.get(args).user;
      }
    } catch (err) {
      return message.reply(emoji.denyEmoji + " What is that User ID.");
    }

    if (target.bot === true)
      return message.reply(
        emoji.denyEmoji +
          " Neither can you check a bot's balance, or give money to them."
      );

    const userId = target.id;

    const results = await economySchema.findOne({
      userId,
    });

    function item(itemName) {
      return shopItems.find(
        (value) => value.name.toLowerCase() === itemName.toLowerCase()
      );
    }

    let inventory;

    if (!results || results.inventory.length === 0)
      inventory = "There's nothing here :(";

    else
      inventory = results.inventory
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(
          (value) =>
            `${item(value.name).emoji} **${item(value.name).displayName}** \`${
              value.name
            }\` ─ ${value.amount}\n${item(value.name).description}`
        )
        .join("\n\n");

    const splitString = util.splitString(inventory, 15);

    if (splitString.length === 1) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor("a-z sort!")
        .setTitle(`${target.username}'s inventory`)
        .setDescription(inventory)
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } else if (splitString.length > 1) {
      const embeds = [];
      for (let i = 0; i < splitString.length; i++) {
        const embed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor("a-z sort!")
          .setTitle(`${target.username}'s inventory`)
          .setDescription(splitString[i])
          .setTimestamp();
        embeds.push(embed);
      }

      pagination({
        embeds: embeds,
        author: message.author,
        channel: message.channel,
        fastSkip: true,
        time: 60000,
        button: [
          {
            name: "first",
            emoji: emoji.firstEmoji,
            style: "PRIMARY",
          },
          {
            name: "previous",
            emoji: emoji.leftEmoji,
            style: "PRIMARY",
          },
          {
            name: "next",
            emoji: emoji.rightEmoji,
            style: "PRIMARY",
          },
          {
            name: "last",
            emoji: emoji.lastEmoji,
            style: "PRIMARY",
          },
        ],
      });
    }
  },
};
