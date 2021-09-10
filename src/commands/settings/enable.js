const util = require("../../util/util");

const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["enable"],
  memberName: "enable",
  group: "settings",
  description: "Enable a command from its disabled state.",
  format: "<commandName>",
  examples: ["enable pokedex", "enable docs"],
  userPermissions: ["MANAGE_GUILD"],
  singleArgs: true,
  cooldown: 5,
  guildOnly: true,
  guarded: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " Please specify what command should be enabled."
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

    const settings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    const errMessage = emoji.denyEmoji + " That command is already enabled.";

    if (!settings || !settings.commands) return message.reply(errMessage);

    if (command.memberName in settings.commands) {
      if (settings.commands[command.memberName])
        return message.reply(errMessage);
    } else {
      return message.reply(errMessage);
    }

    settings.commands[command.memberName] = true;
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
        ` Successfully enabled the **${command.memberName}** command.`
    );
  },
};
