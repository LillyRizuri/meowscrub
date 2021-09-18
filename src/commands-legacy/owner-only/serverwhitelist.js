const Discord = require("discord.js");

const guildBlacklistSchema = require("../../models/guild-blacklist-schema");

const confirmId = "confirmGuildWhitelist";
const abortId = "cancelGuildWhitelist";

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["serverwhitelist", "guildwhitelist", "serverunban"],
  memberName: "serverwhitelist",
  group: "owner-only",
  description: "Whitelist a server that exists in the database.",
  details: "Only the bot owner(s) may use this command.",
  format: "<@user | userID>",
  examples: ["serverwhitelist 692346925428506777"],
  singleArgs: true,
  ownerOnly: true,
  guarded: true,
  hidden: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " You need a valid User ID in order to continue."
      );

    const guildId = args;

    const results = await guildBlacklistSchema.findOne({
      guildId,
    });

    if (!results)
      return message.reply(
        emoji.denyEmoji +
          ` The guild with this ID: **${guildId}** hasn't been blacklisted. What are you trying to do?`
      );

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setCustomId(confirmId)
        .setLabel("Confirm"),
      new Discord.MessageButton()
        .setStyle("DANGER")
        .setCustomId(abortId)
        .setLabel("Abort")
    );

    const msg = await message.reply({
      content: `
You will attempt to whitelist this guild with this ID: **${guildId}**.  
Please confirm your choice by clicking one of the buttons below.    
      `,
      components: [row],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    msg
      .awaitMessageComponent({ filter, time: 30000, componentType: "BUTTON" })
      .then(async (interaction) => {
        for (let i = 0; i < row.components.length; i++) {
          if (
            interaction.customId.toLowerCase() ===
            row.components[i].customId.toLowerCase()
          ) {
            row.components[i].setDisabled();
          } else {
            row.components[i].setStyle("SECONDARY").setDisabled();
          }
        }

        switch (interaction.customId) {
          case confirmId:
            try {
              await guildBlacklistSchema.findOneAndDelete({
                guildId,
              });
            } finally {
              await interaction.message.edit({
                content: `You've made your choice to whitelist the guild with this ID: **${guildId}**.\nOperation complete.`,
                components: [row],
              });
            }
            break;
          case abortId:
            await interaction.message.edit({
              content: "Operation aborted.",
              components: [row],
            });
            break;
        }

        await interaction.deferUpdate();
      })
      .catch(() => {
        message.channel.send(
          `${message.author.toString()}, No reaction after 30 seconds, operation aborted.`
        );
      });
  },
};
