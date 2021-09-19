const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["purge", "clean", "clear"],
  memberName: "purge",
  group: "moderation",
  description:
    "Clean a number of messages with or without flags. The command will not acknowledge pinned messages.",
  details:
    "All flags you can use at the end of the command argument:\n@user, bots, embeds",
  format: "<number> [flags]",
  examples: ["purge 25", "purge 60 @frockles"],
  clientPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY", "EMBED_LINKS"],
  userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
  cooldown: 3,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji +
          " No valid numbers of messages that you want to clean..."
      );

    const amountToDelete = Number(args[0]);

    if (isNaN(amountToDelete))
      return message.reply(
        emoji.denyEmoji + " Are you trying to break me using things like that?"
      );

    if (!Number.isInteger(amountToDelete))
      return message.reply(
        emoji.denyEmoji +
          " How am I supposed to purge if the value isn't an integer?"
      );

    if (!amountToDelete || amountToDelete < 2 || amountToDelete > 100)
      return message.reply(
        emoji.denyEmoji +
          " The number of messages you want to clean must be somewhere in-between 2 and 100."
      );

    await message.delete();

    const filterUsed = [];
    const fetched = await message.channel.messages.fetch({ limit: 100 });
    let deletable = fetched.filter((msg) => !msg.pinned);

    if (args[1]) {
      const argsSplit = args.slice(1).join(" ");
      const target = message.mentions.users.first();

      if (target) {
        deletable = deletable.filter((msg) => msg.author.id === target.id);
        filterUsed.push(`@${target.tag}`);
      }

      if (argsSplit.toLowerCase().includes("bots")) {
        deletable = deletable.filter((msg) => msg.author.bot);
        filterUsed.push("bots");
      }

      if (argsSplit.toLowerCase().includes("embeds")) {
        deletable = deletable.filter((msg) => msg.embeds.length >= 1);
        filterUsed.push("embeds");
      }
    }

    if (filterUsed.length === 0) filterUsed.push("None");

    deletable = deletable.first(amountToDelete);

    try {
      const messagesDeleted = await message.channel.bulkDelete(deletable);
      if (messagesDeleted.size <= 0) {
        await message.channel.send(
          message.author.toString() +
            emoji.denyEmoji +
            `, No messages has been deleted with these filters: \`${filterUsed.join(
              ", "
            )}\`\nConsider extending how many messages would you want to delete, or remove some filters.`
        );
      } else {
        await message.channel.send(
          message.author.toString() +
            emoji.successEmoji +
            `Successfully cleaned **${
              messagesDeleted.size
            }** message(s) with these filters: \`${filterUsed.join(", ")}\``
        );
      }
    } catch (err) {
      message.channel.send(
        emoji.denyEmoji +
          " Message older than 14 days can't be cleaned off due to how Discord API works."
      );
    }
  },
};
