const Discord = require("discord.js");

const util = require("../../util/util");

const {
  denyEmoji,
  successEmoji,
} = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["help", "commands"],
  memberName: "help",
  group: "util",
  description:
    "Displays a list of available commands, or detailed information for a specified command.",
  details:
    "The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.",
  format: "[commandName]",
  examples: ["help", "help prefix"],
  cooldown: 5,
  singleArgs: true,
  guarded: true,
  callback: async (client, message, args) => {
    const prefix = message.guild
      ? await util.getPrefix(message.guild.id)
      : await util.getPrefix();
    const groups = client.registryGroups;
    const commands = util.findCommands(args.toLowerCase());

    if (args) {
      if (commands.length === 1) {
        const command = commands[0];
        const registryCommand = groups.get(command.group);
        const cmdFormat = command.format ? ` ${command.format}` : "";
        const aliases = [...command.aliases];
        aliases.shift();

        const help = `
${command.guildOnly ? " [Usable only in servers]" : ""} ${
          command.nsfw ? " [NSFW]" : ""
        }`;

        const helpEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor(
            `${registryCommand.name}: ${command.aliases[0]} (${registryCommand.id}:${command.memberName})`
          )
          .setTitle(command.description.trim())
          .setDescription(help)
          .addField(
            "Format",
            `⠀• ${prefix}${command.aliases[0]}${cmdFormat}\n⠀• @${client.user.tag} ${command.aliases[0]}${cmdFormat}`
          )
          .setFooter("<required> | [optional]")
          .setTimestamp();

        if (aliases.length > 0)
          helpEmbed.addField("Aliases", `⠀• ${aliases.join(", ")}`);

        if (command.details)
          helpEmbed.addField("Details", `⠀• ${command.details.trim()}`);

        if (command.examples) {
          const examples = [];
          for (const example of command.examples) {
            examples.push(`⠀• ${example}`);
          }

          helpEmbed.addField("Examples", examples.join("\n"));
        }

        if (command.clientPermissions && command.clientPermissions.length !== 0) {
          const botPermsArray = [];
          for (const clientPermission of command.clientPermissions) {
            botPermsArray.push(
              clientPermission.split("_").join(" ").toProperCase()
            );
          }
          helpEmbed.addField("Bot Permission(s)", `⠀• ${botPermsArray.join(", ")}`, true);
        }

        if (command.userPermissions && command.userPermissions.length !== 0) {
          const userPermsArray = [];
          for (const userPermission of command.userPermissions) {
            userPermsArray.push(
              userPermission.split("_").join(" ").toProperCase()
            );
          }
          helpEmbed.addField("User Permission(s)", `⠀• ${userPermsArray.join(", ")}`, true);
        }

        try {
          await message.channel.send({ embeds: [helpEmbed] });
        } catch (err) {
          await message.reply(
            denyEmoji +
              " Unable to send you the help DM. You probably have DMs disabled."
          );
        }
      } else if (commands.length > 15) {
        return message.reply(
          denyEmoji + " Multiple commands found. Please be more specific."
        );
      } else if (commands.length > 1) {
        const commandsFound = [];
        commands.forEach((command) => {
          commandsFound.push(command.memberName);
        });

        return message.reply(
          denyEmoji +
            ` Multiple commands found. Please be more specific:\n\`${commandsFound.join(
              ", "
            )}\``
        );
      } else {
        return message.reply(
          denyEmoji +
            " Unable to identify command. Please use the `help` command to view the list of all commands."
        );
      }
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle("Welcome to the Command Help Panel!")
        .setColor("RANDOM")
        .setDescription(
          `
To run a command in ${message.guild ? message.guild.name : "any server"}, use:
⠀• \`${prefix}commandName\`
⠀• \`@${client.user.tag} commandName\`.

To run a command in this DM, simply use \`commandName\` without any prefix.
    
Use \`${prefix}help commandName\` to view detailed information about a specific command.
    
__**Select available command categories in ${message.guild || "this DM"}.**__`
        )
        .setFooter(
          `Total of ${groups.size} categories, ${client.commands.size} commands`
        )
        .setTimestamp();

      const components = (state) => [
        new Discord.MessageActionRow().addComponents(
          new Discord.MessageSelectMenu()
            .setCustomId("help-menu")
            .setPlaceholder(
              state
                ? "Selection unavailable."
                : "Awaiting for category selection..."
            )
            .setDisabled(state)
            .addOptions(
              {
                label: "Starting Page",
                value: "starting-page",
                description: "Return to the starting page.",
                emoji: "↩️",
              },
              groups
                .filter((grp) =>
                  grp.commands.some(
                    (cmd) =>
                      !cmd.hidden && (message.guild ? cmd : !cmd.guildOnly)
                  )
                )
                .map((grp) => {
                  return {
                    label: grp.name,
                    value: grp.id.toLowerCase(),
                    description: `Commands from ${grp.name}.`,
                    emoji: grp.emoji,
                  };
                })
            )
        ),
      ];

      try {
        const initialMessage = await message.author.send({
          embeds: [embed],
          components: components(false),
        });

        if (message.guild)
          message.reply(successEmoji + " Sent you a DM with information.");

        const filter = (interaction) =>
          interaction.user.id === message.author.id;

        const collector = initialMessage.createMessageComponentCollector({
          filter,
          componentType: "SELECT_MENU",
          time: 60000,
        });

        collector.on("collect", (interaction) => {
          const [directory] = interaction.values;
          if (directory === "starting-page") {
            embed
              .setTitle("Welcome to the Command Help Panel!")
              .setColor("RANDOM")
              .setDescription(
                `
To run a command in ${message.guild ? message.guild.name : "any server"}, use:
⠀• \`${prefix}<commandName>\`
⠀• \`@${client.user.tag} <commandName>\`.
                
To run a command in this DM, simply use \`<commandName>\` without any prefix.
                    
Use \`${prefix}help <commandName>\` to view detailed information about a specific command.
                    
__**Select available command categories in ${message.guild || "this DM"}.**__`
              )
              .setFooter(
                `Total of ${groups.size} categories, ${client.commands.size} commands`
              )
              .setTimestamp();

            return interaction.update({ embeds: [embed] });
          }
          let grp;
          if (message.guild) {
            grp = client.registryGroups
              .filter((group) =>
                group.commands.some(
                  (cmd) => !cmd.hidden && cmd.group === directory
                )
              )
              .find((group) => group.id === directory);
          } else {
            grp = client.registryGroups
              .filter((group) =>
                group.commands.some(
                  (cmd) =>
                    !cmd.hidden && !cmd.guildOnly && cmd.group === directory
                )
              )
              .find((group) => group.id === directory);
          }

          // grp.commands
          //   .filter(
          //     (cmd) => !cmd.hidden && (message.guild ? cmd : !cmd.guildOnly)
          //   )
          //   .map((cmd) => `\`${cmd.aliases[0]}\``)
          //   .join(" ")
          //   .toString();

          embed
            .setColor("RANDOM")
            .setTitle(`Commands from ${grp.name}`)
            .setDescription(
              grp.commands
                .filter(
                  (cmd) => !cmd.hidden && (message.guild ? cmd : !cmd.guildOnly)
                )
                .map(
                  (cmd) =>
                    `[**${cmd.aliases[0]}${
                      cmd.format ? ` ${cmd.format}` : ""
                    }**](https://tryitands.ee/)\n└─${cmd.description}${
                      cmd.nsfw ? " (NSFW)" : ""
                    }`
                )
                .join("\n\n")
                .toString()
            )
            .setTimestamp();

          interaction.update({ embeds: [embed] });
        });

        collector.on("end", () => {
          initialMessage.edit({ components: components(true) });
        });
      } catch (err) {
        await message.reply(
          denyEmoji +
            " Unable to send you the help DM. You probably have DMs disabled."
        );
      }
    }
  },
};
