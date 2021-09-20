const { SlashCommandBuilder } = require("@discordjs/builders");

const tagsSchema = require("../../models/tags-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Manage custom commands in the current server.")
    .addSubcommand((command) =>
      command
        .setName("add")
        .setDescription("Add a custom command in the current server.")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("The new custom command's name")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("response")
            .setDescription("The new custom command's response")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("del")
        .setDescription("Delete a custom command in the current server.")
        .addStringOption((option) =>
          option
            .setName("tag-name")
            .setDescription("The custom command's name")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("info")
        .setDescription("Shows the creator of a specified custom command.")
        .addStringOption((option) =>
          option
            .setName("tag-name")
            .setDescription("The custom command's name")
            .setRequired(true)
        )
    )
    .addSubcommand((command) =>
      command
        .setName("list")
        .setDescription("List all custom commands in the current server.")
    )
    .addSubcommand((command) =>
      command
        .setName("execute")
        .setDescription("Execute a custom command in the current server.")
        .addStringOption((option) =>
          option
            .setName("tag-name")
            .setDescription("The custom command's name")
            .setRequired(true)
        )
    ),
  group: "util",
  examples: [
    "tag add hi hello",
    "tag del hi",
    "tag info hi",
    "tag list",
    "tag execute hi",
  ],
  guildOnly: true,
  callback: async (client, interaction) => {
    function haveRequiredPerm() {
      const channelPerms = interaction.channel
        .permissionsFor(interaction.user)
        .toArray();

      if (!channelPerms.includes("MANAGE_GUILD")) {
        interaction.reply({
          content:
            emoji.denyEmoji +
            " This command requires you to have the following permission(s): `MANAGE_GUILD` in order to use this command.",
          ephemeral: true,
        });
        return false;
      }

      return true;
    }

    switch (interaction.options.getSubcommand()) {
      case "add": {
        if (!haveRequiredPerm()) return;
        const name = interaction.options.getString("name").toLowerCase();
        const response = interaction.options.getString("response");
        const authorId = interaction.user.id;

        if (name.includes(" "))
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " The name isn't allowed to have whitespace characters.",
            ephemeral: true,
          });

        const tagsConfig = await tagsSchema.findOne({
          guildId: interaction.guild.id,
        });

        if (tagsConfig && tagsConfig.tags.length >= 50)
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " Maximum number of custom commands have been reached (50 custom commands).\nPlease remove a custom command before advancing.",
            ephemeral: true,
          });

        if (name.length > 32)
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " The custom command name can't have over 32 characters.",
            ephemeral: true,
          });

        if (
          tagsConfig &&
          tagsConfig.tags.some((i) => i.name.toLowerCase() === name)
        )
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " There's already a command with that name. Try again with another.",
            ephemeral: true,
          });

        const params = {
          name,
          response,
          authorId,
        };

        await tagsSchema.findOneAndUpdate(
          {
            guildId: interaction.guild.id,
          },
          {
            guildId: interaction.guild.id,
            $push: {
              tags: params,
            },
          },
          {
            upsert: true,
          }
        );

        await interaction.reply(
          emoji.successEmoji +
            ` Successfully created a custom command with this name: \`${name}\`.`
        );
        break;
      }
      case "del": {
        if (!haveRequiredPerm()) return;
        const name = interaction.options.getString("tag-name").toLowerCase();

        const tagsConfig = await tagsSchema.findOne({
          guildId: interaction.guild.id,
        });

        if (
          !tagsConfig ||
          !tagsConfig.tags.some((i) => i.name.toLowerCase() === name)
        )
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " That command doesn't exist. What are you planning?",
            ephemeral: true,
          });

        await tagsSchema.findOneAndUpdate(
          {
            guildId: interaction.guild.id,
          },
          {
            guildId: interaction.guild.id,
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

        await interaction.reply(
          emoji.successEmoji +
            ` Successfully deleted a custom command with this name: \`${name}\`.`
        );
        break;
      }
      case "info": {
        const name = interaction.options.getString("tag-name").toLowerCase();

        const tagsConfig = await tagsSchema.findOne({
          guildId: interaction.guild.id,
        });

        if (
          !tagsConfig ||
          !tagsConfig.tags.some((i) => i.name.toLowerCase() === name)
        )
          return interaction.reply({
            content:
              emoji.denyEmoji +
              " That command doesn't exist. What are you planning?",
            ephemeral: true,
          });

        const tag = tagsConfig.tags.find((i) => i.name.toLowerCase() === name);

        interaction.reply(
          `**__Tag \`${tag.name}\`:__** Created by \`${
            (await client.users.fetch(tag.authorId)).tag
          }\``
        );
        break;
      }
      case "list": {
        const tagsConfig = await tagsSchema.findOne({
          guildId: interaction.guild.id,
        });

        let tagsList = "";

        if (!tagsConfig || !tagsConfig.tags || tagsConfig.tags.length === 0)
          tagsList = "There's nothing here :(";
        else
          tagsList = tagsConfig.tags
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((tag) => `\`${tag.name}\``)
            .join(", ");

        interaction.reply(
          `**__All tags in \`${interaction.guild.name}\`:__**\n${tagsList}`
        );
        break;
      }
      case "execute": {
        const name = interaction.options.getString("tag-name").toLowerCase();
        const tagsConfig = await tagsSchema.findOne({
          guildId: interaction.guild.id,
        });

        if (tagsConfig) {
          const tag = tagsConfig.tags.find(
            (i) => i.name.toLowerCase() === name
          );

          if (tag) interaction.reply(tag.response);
          else
            interaction.reply({
              content:
                emoji.denyEmoji +
                " That command doesn't exist. What are you planning?",
              ephemeral: true,
            });
        } else
          interaction.reply({
            content:
              emoji.denyEmoji +
              " That command doesn't exist. What are you planning?",
            ephemeral: true,
          });
        break;
      }
    }
  },
};
