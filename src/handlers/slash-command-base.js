/* eslint-disable no-unused-vars */
/* eslint-disable no-inline-comments */
/* eslint-disable prefer-const */
const modPerms = require("../assets/json/mod-permissions.json");
const normalPerms = require("../assets/json/normal-permissions.json");

const botInfoSchema = require("../models/bot-info-schema");
// const userBlacklistSchema = require("../models/user-blacklist-schema");

const { denyEmoji } = require("../assets/json/tick-emoji.json");

// validate permissions input
function validatePerms(permissions) {
  const validPerms = normalPerms.concat(modPerms);

  for (const permission of permissions) {
    if (!validPerms.includes(permission))
      throw new Error(`Invalid permission detected: "${permission}"`);
  }
}

const allCommands = {};

module.exports = (client, commandOptions) => {
  let {
    data,
    subCommands = [],
    memberName = "", // don't use in command files
    group = "",
    type = "", // don't use in command files
    description = "", // only use if it's a context menu command
    details = "",
    format = "", // don't use in command files
    examples = [],
    clientPermissions = [],
    userPermissions = [],
    guildOnly = false,
    ownerOnly = false,
    callback,
  } = commandOptions;

  memberName = data.name.toLowerCase().split(/\s+/).join("-");
  if (data.description) description = data.description;

  const initialFormat = [];
  if (data.options && data.options.length > 0) {
    data.options.forEach((option) => {
      if (option.constructor.name === "SlashCommandSubcommandBuilder") return;
      if (option.required) initialFormat.push(`<${option.name}>`);
      else initialFormat.push(`[${option.name}]`);
    });
  }

  format = initialFormat.join(" ");

  const initialSubcommands = [];
  if (data.options && data.options.length > 0) {
    data.options.forEach((option) => {
      if (option.constructor.name !== "SlashCommandSubcommandBuilder") return;
      const options = option.options;
      const subCmdFormat = [];
      if (options.length > 0) {
        options.forEach((opt) => {
          if (opt.required) subCmdFormat.push(`<${opt.name}>`);
          else subCmdFormat.push(`[${opt.name}]`);
        });
      }
      initialSubcommands.push(`${option.name} ${subCmdFormat.join(" ")}`);
    });
  }

  subCommands = initialSubcommands;

  if (typeof examples === "string") examples = [examples];

  switch (data.type) {
    default:
      type = "Slash Command";
      break;
    case 2:
      type = "User Context Menu";
      break;
    case 3:
      type = "Message Context Menu";
      break;
  }

  // eslint-disable-next-line no-lonely-if
  if (!description)
    throw new Error(`The command ${memberName} must have a description.`);

  if (typeof description !== "string")
    throw new Error(
      `The command ${memberName} must have the description as a string.`
    );

  if (!group)
    throw new Error(`The command ${memberName} must belong in a group.`);
  if (typeof group !== "string")
    throw new Error(
      `The command ${memberName} must have the group as a string.`
    );

  let placeholderString = "";
  client.commandGroups.forEach((grp) => {
    if (grp[0] === group) placeholderString = grp[0];
  });

  if (!placeholderString)
    throw new Error(
      `The command ${memberName} belongs in an non-existent group.`
    );

  if (clientPermissions.length) {
    if (typeof clientPermissions === "string")
      clientPermissions = [clientPermissions];

    validatePerms(clientPermissions);
  }

  if (userPermissions.length) {
    if (typeof userPermissions === "string")
      userPermissions = [userPermissions];

    validatePerms(userPermissions);
  }

  allCommands[data.name] = {
    data,
    subCommands,
    memberName,
    group,
    type,
    description,
    details,
    format,
    examples,
    clientPermissions,
    userPermissions,
    guildOnly,
    ownerOnly,
    callback,
  };

  return allCommands[data.name];
};

module.exports.listen = (client) => {
  client.on("interactionCreate", async (interaction) => {
    // eslint-disable-next-line no-empty
    if (interaction.isCommand() || interaction.isContextMenu()) {
    } else return;

    const command = allCommands[interaction.commandName];
    if (!command) return;

    const {
      memberName,
      group,
      description,
      details,
      format,
      examples,
      clientPermissions,
      userPermissions,
      guildOnly,
      ownerOnly,
      callback,
    } = command;

    client.emit("debug", `Running application command ${group}:${memberName}`);

    // const blacklistedRes = await userBlacklistSchema.findOne({
    //   userId: interaction.user.id,
    // });

    // if (blacklistedRes)
    //   return interaction.reply({
    //     content:
    //       denyEmoji +
    //       " You are blacklisted from accessing my stuff. The only way for you to use my functionality again is to appeal.",
    //     ephemeral: true,
    //   });

    if (ownerOnly)
      if (!client.isOwner(interaction.user))
        return interaction.reply({
          content:
            denyEmoji +
            " Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s).",
          ephemeral: true,
        });

    if (guildOnly)
      if (!interaction.inGuild())
        return interaction.reply({
          content: denyEmoji + " You can only use this command in a server.",
          ephemeral: true,
        });

    const userMissingPerms = [];
    const clientMissingPerms = [];

    if (interaction.guild) {
      // check if the message author doesn't have the required permissions
      const channel = interaction.guild.channels.cache.get(
        interaction.channelId
      );

      const chPermissionsAuthor = channel
        .permissionsFor(interaction.user)
        .toArray();
      for (const permission of userPermissions) {
        if (!chPermissionsAuthor.includes(permission))
          userMissingPerms.push(permission.split("_").join(" ").toProperCase());
      }

      if (userMissingPerms.length > 0)
        return interaction.reply({
          content:
            denyEmoji +
            ` This command requires you to have the following permission(s): \`${userMissingPerms.join(
              ","
            )}\` in order to use this command.`,
          ephemeral: true,
        });

      // check if the client doesn't have the required permissions
      const chPermissionsClient = channel
        .permissionsFor(client.user.id)
        .toArray();
      for (const permission of clientPermissions) {
        if (!chPermissionsClient.includes(permission))
          clientMissingPerms.push(
            permission.split("_").join(" ").toProperCase()
          );
      }

      if (clientMissingPerms.length > 0)
        return interaction.reply({
          content:
            denyEmoji +
            ` I need to have the following permission(s): \`${clientMissingPerms.join(
              ","
            )}\` in order to run this command.`,
          ephemeral: true,
        });
    }

    callback(client, interaction)
      .then(async () => {
        let botInfo = await botInfoSchema.findOne();
        if (!botInfo) {
          await new botInfoSchema({
            cmdsExecuted: 0,
          }).save();

          botInfo = await botInfoSchema.findOne();
        }
        await botInfoSchema.updateOne({
          cmdsExecuted: botInfo.cmdsExecuted + 1,
        });
      })
      .catch(async (err) => {
        const dateTimeOptions = {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short",
        };

        const currentDate = new Date().toLocaleDateString(
          "en-US",
          dateTimeOptions
        );

        console.log(err);
        interaction.channel.send({
          content: `
An unexpected error occurred whie executing the command.
You shouldn't receive an error like this. Please contact my owner and report the error with the text below.
\`\`\`
User: ${interaction.user.tag} (${interaction.user.id})
Command: ${memberName}
Last Ran: ${currentDate}

───── ERROR ─────
${err}
\`\`\`
          `,
          ephemeral: true,
        });
      });
  });
};
