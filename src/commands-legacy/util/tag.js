const tagsSchema = require("../../models/tags-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["tag"],
  memberName: "tag",
  group: "util",
  description: "Manage custom commands in the current server.",
  details: `
All available methods:
- add <name> <response>
- del <tagName>
- list
- <tagName> 
  `,
  format: "<method> <...arguments>",
  examples: ["tag add hi hello", "tag del hi", "tag list", "tag hi"],
  cooldown: 3,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    function haveRequiredPerm() {
      const channelPerms = message.channel
        .permissionsFor(message.author)
        .toArray();

      if (!channelPerms.includes("MANAGE_GUILD")) {
        message.reply(
          emoji.denyEmoji +
            " This command requires you to have the following permission(s): `MANAGE_GUILD` in order to use this command."
        );
        return false;
      }

      return true;
    }

    const argsSplit = args.split(/\s+/);
    const firstArg = argsSplit[0].toLowerCase();

    if (!firstArg)
      return message.reply(
        emoji.missingEmoji +
          " You must provide one of these methods first:\n`add <name> <response>` | `del <tagName>` | `list` | `<tagName>`"
      );

    switch (firstArg) {
      case "add": {
        if (!haveRequiredPerm()) return;
        const name = argsSplit[1] ? argsSplit[1].toLowerCase() : "";
        const response = args.replace(firstArg, "").replace(name, "").trim();

        const tagsConfig = await tagsSchema.findOne({
          guildId: message.guild.id,
        });

        if (tagsConfig && tagsConfig.tags.length >= 50)
          return message.reply(
            emoji.denyEmoji +
              " Maximum number of custom commands have been reached (50 custom commands).\nPlease remove a custom command before advancing."
          );

        if (!name)
          return message.reply(
            emoji.missingEmoji +
              " Please specify a name for your custom command."
          );

        if (name.length > 32)
          return message.reply(
            emoji.denyEmoji +
              " The custom command name can't have over 32 characters."
          );

        if (!response)
          return message.reply(
            emoji.missingEmoji +
              " Please specify the custom command's response before continue."
          );

        if (
          tagsConfig &&
          tagsConfig.tags.some((i) => i.name.toLowerCase() === name)
        )
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
        break;
      }
      case "del": {
        if (!haveRequiredPerm()) return;
        const name = argsSplit[1] ? argsSplit[1].toLowerCase() : "";

        if (!name)
          return message.reply(
            emoji.missingEmoji +
              " Please specify an existing custom command's name."
          );

        const results = await tagsSchema.findOne({
          guildId: message.guild.id,
        });

        if (
          !results ||
          !results.tags.some((i) => i.name.toLowerCase() === name)
        )
          return message.reply(
            emoji.denyEmoji +
              " That command doesn't exist. What are you planning?"
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
        break;
      }
      case "list": {
        const tagsConfig = await tagsSchema.findOne({
          guildId: message.guild.id,
        });

        let tagsList = "";

        if (!tagsConfig || !tagsConfig.tags || tagsConfig.tags.length === 0)
          tagsList = "There's nothing here :(";
        else
          tagsList = tagsConfig.tags
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((tag) => `\`${tag.name}\``)
            .join(", ");

        message.channel.send(
          `**__All tags in ${message.guild.name}:__**\n${tagsList}`
        );
        break;
      }

      default: {
        const tagsConfig = await tagsSchema.findOne({
          guildId: message.guild.id,
        });

        if (tagsConfig) {
          const tag = tagsConfig.tags.find(
            (i) => i.name.toLowerCase() === firstArg.toLowerCase()
          );

          if (tag) message.channel.send(tag.response);
          else
            message.reply(
              emoji.denyEmoji +
                " That command doesn't exist. What are you planning?"
            );
        }
        break;
      }
    }
  },
};
