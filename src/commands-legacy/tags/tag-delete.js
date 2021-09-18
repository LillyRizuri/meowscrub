const tagsSchema = require("../../models/tags-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["tag-delete", "tag-remove", "cc-delete", "cc-remove"],
  memberName: "tag-delete",
  group: "tags",
  description: "Delete an existing custom command in the current server.",
  format: "<tagName>",
  examples: ["tag-delete hi", "tag-delete ok-what"],
  userPermissions: ["ADMINISTRATOR"],
  singleArgs: true,
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message, args) => {
    const name = args.toLowerCase();

    if (!name)
      return message.reply(
        emoji.missingEmoji +
          " Please specify an existing custom command's name."
      );

    const results = await tagsSchema.findOne({
      guildId: message.guild.id,
    });

    if (!results || !results.tags.some((i) => i.name.toLowerCase() === name))
      return message.reply(
        emoji.denyEmoji + " That command doesn't exist. What are you planning?"
      );

    await tagsSchema.findOneAndUpdate(
      {
        guildId: message.guild.id,
      },
      {
        guildId: message.guild.id,
        $pull: {
          tags: {
            name,
          },
        },
      },
      {
        upsert: true,
      }
    );

    await message.reply(
      emoji.successEmoji +
        ` Successfully deleted a custom command with this name: \`${name}\`.`
    );
  },
};
