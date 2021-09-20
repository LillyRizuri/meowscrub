const util = require("../../util/util");

const {
  denyEmoji,
  successEmoji,
} = require("../../assets/json/tick-emoji.json");
const defaultPrefix = process.env.PREFIX;

module.exports = {
  aliases: ["prefix"],
  memberName: "prefix",
  group: "util",
  description: "Shows or set the command prefix.",
  format: '[prefix | "default"]',
  examples: ["prefix", "prefix +", "prefix omg!", "prefix default"],
  singleArgs: true,
  cooldown: 3,
  guarded: true,
  callback: async (client, message, args) => {
    if (!args) {
      const prefix = message.guild
        ? await util.getPrefix(message.guild.id)
        : defaultPrefix;
      return message.reply(
        `${
          prefix
            ? `The command prefix is \`${prefix}\`.`
            : "There is no command prefix."
        }\nTo run commands ${
          message.guild
            ? `in this server, use \`${prefix}command\` or \`@${client.user.tag} command\`.`
            : "in this DM, type in the command name without any prefixes."
        }`
      );
    }

    if (args) {
      if (!message.guild)
        return message.reply(
          denyEmoji + " You can't change prefix in direct messages."
        );

      if (!message.member.permissions.has("MANAGE_GUILD"))
        return message.reply(
          denyEmoji +
            " This command requires you to also have these permissions: `Manage Guild` in order to use this command."
        );
    }

    let prefix = args.toLowerCase();
    let response = "";

    if (prefix === "default") {
      await util.prefixChange(message.guild.id, null);
      const current = defaultPrefix ? `\`${defaultPrefix}\`` : "no prefix";
      response =
        successEmoji +
        ` Reset the command prefix to the default (currently ${current}).`;
    } else {
      const newPrefix = await util.prefixChange(message.guild.id, prefix);
      response = newPrefix
        ? successEmoji + ` Set the command prefix to \`${newPrefix}\`.`
        : successEmoji + " Removed the command prefix entirely.";
    }

    // set prefix to cache
    const guildId = message.guild.id;
    prefix = await util.getPrefix(guildId);
    client.guildPrefixes[guildId] = prefix;

    await message.reply(
      `${response}\n To run commands in this server, use \`${prefix}command\` or \`@${client.user.tag} command\`.`
    );
  },
};
