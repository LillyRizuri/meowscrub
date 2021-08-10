const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { PaginatedEmbed } = require("embed-paginator");

const modules = require("../../modules");

const economySchema = require("../../models/economy-schema");

const shopItems = require("../../assets/js/item");

module.exports = class BalCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "inventory",
      aliases: ["inv"],
      group: "economy",
      memberName: "inventory",
      description: "Check your/someone else's inventory.",
      argsType: "single",
      format: "[@user/userID]",
      examples: [
        "inventory",
        "inventory @frockles",
        "inventory 693832549943869493",
      ],
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
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
      return message.reply(
        "<:scrubred:797476323169533963> What is that User ID."
      );
    }

    if (target.bot === true)
      return message.reply(
        "<:scrubred:797476323169533963> Neither can you check a bot's balance, or give money to them."
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

    let inventory = results.inventory
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (value) =>
          `${item(value.name).emoji} **${item(value.name).displayName}** \`${
            value.name
          }\` ─ ${value.amount}\n${item(value.name).description}`
      )
      .join("\n\n");

    const splitString = modules.splitString(inventory, 15);

    if (!results || !inventory) inventory = "There's nothing here :(";

    if (splitString.length === 1) {
      const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor("a-z sort!")
        .setTitle(`${target.username}'s inventory`)
        .setDescription(inventory)
        .setTimestamp();

      message.channel.send(embed);
    } else if (splitString.length > 1) {
      const embed = new PaginatedEmbed({
        colours: ["RANDOM"],
        descriptions: splitString,
        duration: 60 * 1000,
        paginationType: "description",
        itemsPerPage: 1,
      })
        .setAuthor("a-z sort!")
        .setTitle(`${target.username}'s inventory`)
        .setTimestamp();

      embed.send(message.channel);
    }
  }
};
