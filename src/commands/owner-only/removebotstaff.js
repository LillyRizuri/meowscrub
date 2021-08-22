const Discord = require("discord.js");

const botStaffSchema = require("../../models/bot-staff-schema");

const confirmId = "removeBotStaff";
const abortId = "cancelRemovingBotStaff";

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["removebotstaff", "rmbotstaff"],
  memberName: "removebotstaff",
  group: "owner-only",
  description: "Remove an user who is currently the bot staff.",
  details: "Only the bot owner(s) may use this command.",
  format: "<@user/userID>",
  examples: ["removebotstaff 693832549943869493"],
  singleArgs: true,
  ownerOnly: true,
  guarded: true,
  hidden: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " You need a valid User ID in order to continue."
      );

    let target;

    try {
      target =
        message.mentions.users.first() || (await client.users.fetch(args));
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + " What is this ID. Please explain."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          emoji.denyEmoji + " Sigh... Why are you doing that to yourself."
        );
      case client.user:
        return message.reply(
          emoji.denyEmoji + " Making me NOT moderate myself? What the..."
        );
    }

    if (target.bot)
      return message.reply(
        emoji.denyEmoji +
          " Bot can't even interact with my stuff, and same for me too.\nSo why would you want to try?"
      );

    const userId = target.id;

    const results = await botStaffSchema.findOne({
      userId,
    });

    if (!results) {
      return message.reply(
        emoji.denyEmoji +
          ` **${target.tag}** is not a bot staff. What are you trying to do?`
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
You are attempting to remove **${target.tag}** from the bot staff team.      
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
              await botStaffSchema.findOneAndDelete({
                userId,
              });
            } finally {
              await interaction.message.edit({
                content: `You've made your choice to remove **${target.tag}** from the bot staff team.\nOperation complete.`,
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
