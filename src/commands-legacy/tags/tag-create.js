const tagsSchema = require("../../models/tags-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["tag-create", "tag-add", "cc-create", "cc-add"],
  memberName: "tag-create",
  group: "tags",
  description: "Create a custom command in the current server.",
  format: "<name> <response>",
  examples: [
    "tag-create hi hello!",
    "tag-create ok-what what are you talking about",
  ],
  userPermissions: ["ADMINISTRATOR"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const name = args.split(/\s+/)[0].toLowerCase();
    const response = args.replace(name, "");

    if (!name)
      return message.reply(
        emoji.missingEmoji + " Please specify a name for your custom command."
      );

    if (!response)
      return message.reply(
        emoji.missingEmoji +
          " Please specify the custom command's response before continue."
      );

    const results = await tagsSchema.findOne({
      guildId: message.guild.id,
    });

    if (results && results.tags.some((i) => i.name.toLowerCase() === name))
      return message.reply(
        emoji.denyEmoji +
          " There's already a command with that name. Try again with another."
      );

    const params = {
      name,
      response,
    };

    await tagsSchema.findOneAndUpdate(
      {
        guildId: message.guild.id,
      },
      {
        guildId: message.guild.id,
        $push: {
          tags: params,
        },
      },
      {
        upsert: true,
      }
    );

    await message.reply(
      emoji.successEmoji +
        ` Successfully created a custom command with this name: \`${name}\`.`
    );
  },
};
