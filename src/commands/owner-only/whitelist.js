const Discord = require("discord.js");

const botStaffSchema = require("../../models/bot-staff-schema");
const blacklistSchema = require("../../models/user-blacklist-schema");

const confirmId = "confirmWhitelist";
const abortId = "cancelWhitelist";

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["whitelist", "rmblacklist", "bot-unban"],
  memberName: "whitelist",
  group: "owner-only",
  description: "Whitelist an user that exists in the database.",
  details: "Only the bot owner(s) and bot staff(s) may use this command.",
  format: "<@user | userID>",
  examples: ["whitelist @frockles#4339", "whitelist 693832549943869493"],
  singleArgs: true,
  guarded: true,
  hidden: true,
  callback: async (client, message, args) => {
    const isBotStaff = await botStaffSchema.findOne({
      userId: message.author.id,
    });

    // eslint-disable-next-line no-empty
    if (isBotStaff || client.isOwner(message.author)) {
    } else {
      return message.reply(
        emoji.denyEmoji +
          " Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s) and bot staff(s)."
      );
    }

    if (!args)
      return message.reply(
        emoji.missingEmoji + " You need a valid User ID in order to continue."
      );

    let target;

    try {
      target = await client.users.fetch(args);
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + " What is this ID. Please explain."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          emoji.denyEmoji +
            " Whitelisting yourself? Do you see that you can run commands here?"
        );
      case client.user:
        return message.reply(emoji.denyEmoji + " Whitelisting me? ...");
    }

    if (target.bot)
      return message.reply(
        emoji.denyEmoji +
          " Bot can't even interact with my stuff, and same for me too.\nSo why would you want to try?"
      );

    const userId = target.id;

    const ifTargetStaff = await botStaffSchema.findOne({
      userId,
    });

    if (client.isOwner(target) || ifTargetStaff)
      return message.reply(
        emoji.denyEmoji + " Whitelisting a bot owner or a staff is useless."
      );

    const results = await blacklistSchema.findOne({
      userId,
    });

    if (!results) {
      return message.reply(
        emoji.denyEmoji +
          ` **${target.tag}** hasn't been blacklisted. What are you trying to do?`
      );
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
    const msg = await message.reply({
      content: `
You will attempt to whitelist **${target.tag}**.
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
              await blacklistSchema.findOneAndDelete({
                userId,
              });
            } finally {
              await interaction.message.edit({
                content: `You've made your choice to whitelist **${target.tag}**.\nOperation complete. Restart me for this change to be applied.`,
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
