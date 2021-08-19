const Discord = require("discord.js");

const guildBlacklistSchema = require("../../models/guild-blacklist-schema");

const confirmId = "confirmGuildBlacklist";
const abortId = "cancelGuildBlacklist";

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["serverblacklist", "guildblacklist", "serverban"],
  memberName: "serverblacklist",
  group: "owner-only",
  description: "Prevent a server from inviting me.",
  details: "Only the bot owner(s) and bot staff(s) may use this command.",
  format: '<guildId> ["force"]',
  examples: [
    "serverblacklist 692346925428506777",
    "serverblacklist 692346925428506777 force",
  ],
  ownerOnly: true,
  hidden: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " You need a valid Guild ID in order to continue."
      );

    let target;
    let guildId;

    if (!args[1]) {
      try {
        target = await client.guilds.fetch(args[0]);
      } catch (err) {
        return message.reply(
          emoji.denyEmoji +
            " What is this ID. Please explain.\nBut if the guild you provided DOES exist, use `force` alongside with the Guild ID."
        );
      }
      guildId = target.id;
    } else if (args[1] && args[1].toLowerCase() === "force") {
      guildId = args[0];
    } else {
      return message.reply(
        emoji.denyEmoji + " Did you type in the wrong flag? Please try again."
      );
    }

    const results = await guildBlacklistSchema.findOne({
      guildId,
    });

    if (results)
      return message.reply(
        emoji.denyEmoji +
          ` The guild with this ID: **${guildId}** has already been blacklisted. What are you trying to do?`
      );

    let response = "";
    if (!args[1]) {
      response = `
You will attempt to blacklist this guild: **${target.name}**.
Please confirm your choice by clicking one of the buttons below.         
      `;
    } else if (args[1] && args[1].toLowerCase() === "force") {
      response = `
You will attempt to blacklist this guild: **${guildId}**.
Please confirm your choice by clicking one of the buttons below.      
      `;
    }

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

    const msg = await message.reply({ content: response, components: [row] });

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
              await new guildBlacklistSchema({
                guildId,
              }).save();

              if (client.guilds.cache.get(guildId))
                client.guilds.cache.get(guildId).leave();
            } finally {
              await interaction.message.edit({
                content:
                  "You've made your choice to blacklist **that following guild**.\nOperation complete.",
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

        interaction.deferUpdate();
      })
      .catch(() => {
        message.channel.send(
          `${message.author.toString()}, No reaction after 30 seconds, operation aborted.`
        );
      });
  },
};
