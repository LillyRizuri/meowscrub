const { SlashCommandBuilder } = require("@discordjs/builders");

const Discord = require("discord.js");

const util = require("../../util/util");

const { denyEmoji } = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Displays a list of available commands, or detailed information for a specified command."
    )
    .addStringOption((option) =>
      option.setName("command-name").setDescription("The command's name")
    ),
  group: "util",
  details:
    "The command may be part of a command name or a whole command name. If it isn't specified, all available commands will be listed.",
  examples: ["help", "help prefix"],
  callback: async (client, interaction) => {
    const args = interaction.options._hoistedOptions[0]
      ? interaction.options._hoistedOptions[0].value.toLowerCase()
      : "";
    const groups = client.slashRegistryGroups;
    const commands = util.findSlashCommands(args);

    if (args) {
      if (commands.length === 1) {
        const [command] = commands;
        const registryCommand = groups.get(command.group);
        const cmdFormat = command.format ? ` ${command.format}` : "";

        const help = command.guildOnly ? " [Usable only in servers]" : "";

        const helpEmbed = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor(
            `${registryCommand.name}: ${command.memberName} (${registryCommand.id}:${command.memberName})`
          )
          .setTitle(command.description.trim())
          .setDescription(help)
          .addField("Format", `⠀• ${command.memberName}${cmdFormat}`)
          .setFooter("<required> | [optional]")
          .setTimestamp();

        if (command.details)
          helpEmbed.addField("Details", `⠀• ${command.details.trim()}`);

        if (command.examples) {
          const examples = [];
          for (const example of command.examples) {
            examples.push(`⠀• ${example}`);
          }

          helpEmbed.addField("Examples", examples.join("\n"));
        }

        if (
          command.clientPermissions &&
          command.clientPermissions.length !== 0
        ) {
          const botPermsArray = [];
          for (const clientPermission of command.clientPermissions) {
            botPermsArray.push(
              clientPermission.split("_").join(" ").toProperCase()
            );
          }
          helpEmbed.addField(
            "Bot Permission(s)",
            `⠀• ${botPermsArray.join(", ")}`,
            true
          );
        }

        if (command.userPermissions && command.userPermissions.length !== 0) {
          const userPermsArray = [];
          for (const userPermission of command.userPermissions) {
            userPermsArray.push(
              userPermission.split("_").join(" ").toProperCase()
            );
          }
          helpEmbed.addField(
            "User Permission(s)",
            `⠀• ${userPermsArray.join(", ")}`,
            true
          );
        }

        interaction.reply({ embeds: [helpEmbed] });
      } else if (commands.length > 15) {
        return interaction.reply({
          content:
            denyEmoji + " Multiple commands found. Please be more specific.",
          ephemeral: true,
        });
      } else if (commands.length > 1) {
        const commandsFound = [];
        commands.forEach((command) => {
          commandsFound.push(command.memberName);
        });

        return interaction.reply({
          content:
            denyEmoji +
            ` Multiple commands found. Please be more specific:\n\`${commandsFound.join(
              ", "
            )}\``,
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          content:
            denyEmoji +
            " Unable to identify command. Please use the `help` command to view the list of all commands.",
          ephemeral: true,
        });
      }
    } else {
      const embed = new Discord.MessageEmbed()
        .setTitle("Welcome to the Slash Command Help Panel!")
        .setColor("RANDOM")
        .setDescription(
          `
To run a slash command in ${
            interaction.guild ? interaction.guild.name : "any server"
          } or in my DM, use:
⠀• \`/command-name\`

Use \`/help command-name\` to view detailed information about a specific command.
    
__**Select available command categories in ${
            interaction.guild || "this DM"
          }.**__`
        )
        .setFooter(
          `Total of ${groups.size} categories, ${client.slashCommands.size} commands`
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
                      !cmd.hidden && (interaction.guild ? cmd : !cmd.guildOnly)
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

      await interaction.reply("Help panel active!");
      const initialMessage = await interaction.channel.send({
        embeds: [embed],
        components: components(false),
      });

      const filter = (inter) => inter.user.id === interaction.user.id;
      const collector = initialMessage.createMessageComponentCollector({
        filter,
        componentType: "SELECT_MENU",
        time: 60000,
      });

      collector.on("collect", (inter) => {
        const [directory] = inter.values;
        if (directory === "starting-page") {
          embed
            .setTitle("Welcome to the Slash Command Help Panel!")
            .setColor("RANDOM")
            .setDescription(
              `
  To run a slash command in ${
    interaction.guild ? interaction.guild.name : "any server"
  } or in my DM, use:
  ⠀• \`/command-name\`
  
  Use \`/help command-name\` to view detailed information about a specific command.
      
  __**Select available command categories in ${
    interaction.guild || "this DM"
  }.**__`
            )
            .setFooter(
              `Total of ${groups.size} categories, ${client.slashCommands.size} commands`
            )
            .setTimestamp();

          return inter.update({ embeds: [embed] });
        }
        let grp;
        if (interaction.guild) {
          grp = client.slashRegistryGroups
            .filter((group) =>
              group.commands.some(
                (cmd) => !cmd.hidden && cmd.group === directory
              )
            )
            .find((group) => group.id === directory);
        } else {
          grp = client.slashRegistryGroups
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
                (cmd) =>
                  !cmd.hidden && (interaction.guild ? cmd : !cmd.guildOnly)
              )
              .map(
                (cmd) =>
                  `[**${cmd.memberName}${
                    cmd.format ? ` ${cmd.format}` : ""
                  }**](https://tryitands.ee/)\n└─${cmd.description}${
                    cmd.nsfw ? " (NSFW)" : ""
                  }`
              )
              .join("\n\n")
              .toString()
          )
          .setTimestamp();

        inter.update({ embeds: [embed] });
      });

      collector.on("end", () => {
        initialMessage.edit({ components: components(true) });
      });
    }
  },
};
