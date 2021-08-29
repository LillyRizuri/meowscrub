const util = require("../../util/util");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["disable"],
  memberName: "disable",
  group: "settings",
  description: "Disable a command to prevent members from running them.",
  format: "<commandName>",
  examples: ["disable pokedex", "disable docs"],
  userPermissions: ["ADMINISTRATOR"],
  singleArgs: true,
  cooldown: 5,
  guildOnly: true,
  guarded: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " Please specify what command should be disabled."
      );

    const commands = util.findCommands(args.toLowerCase());

    if (commands.length <= 0)
      return message.reply(
        emoji.denyEmoji + " That command doesn't exist. Try again."
      );

    if (commands.length > 1) {
      const commandsFound = [];
      commands.forEach((command) => {
        commandsFound.push(command.memberName);
      });

      return message.reply(
        emoji.denyEmoji +
          ` Multiple commands found. Please be more specific:\n\`${commandsFound.join(
            ", "
          )}\``
      );
    } else if (commands.length > 15) {
      return message.reply(
        emoji.denyEmoji + " Multiple commands found. Please be more specific."
      );
    }

    const command = commands[0];

    if (command.guarded)
      return message.reply(
        emoji.denyEmoji + " That command can't be disabled."
      );

    let settings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (!settings || !settings.commands) {
      await settingsSchema.findOneAndUpdate(
        {
          guildId: message.guild.id,
        },
        {
          commands: {},
        },
        {
          upsert: true,
        }
      );
    }

    settings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (command.memberName in settings.commands)
      if (!settings.commands[command.memberName])
        return message.reply(
          emoji.denyEmoji + " That command is already disabled."
        );

    settings.commands[command.memberName] = false;
    await settingsSchema.findOneAndUpdate(
      {
        guildId: message.guild.id,
      },
      settings,
      {
        upsert: true,
      }
    );

    await message.reply(
      emoji.successEmoji +
        ` Successfully disabled the **${command.memberName}** command.`
    );
  },
};
