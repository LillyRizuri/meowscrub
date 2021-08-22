const Discord = require("discord.js");

const botStaffSchema = require("../../models/bot-staff-schema");

const confirmId = "addBotStaff";
const abortId = "cancelAddingBotStaff";

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["addbotstaff"],
  memberName: "addbotstaff",
  group: "owner-only",
  description: "Add an user to be the bot staff.",
  details: "Only the bot owner(s) may use this command.",
  format: "<@user/userID>",
  examples: ["addbotstaff 693832549943869493"],
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
          emoji.denyEmoji +
            " Why do you want to add yourself as a bot staff? Sigh..."
        );
      case client.user:
        return message.reply(
          emoji.denyEmoji + " Making me moderate myself? What the..."
        );
    }

    if (target.bot)
      return message.reply(
        emoji.denyEmoji +
          " Bot can't even interact with my stuff, and same for me too.\nSo why would you want to try?"
      );

    const userId = target.id;
    const lastUsername = target.tag;

    const results = await botStaffSchema.findOne({
      userId,
    });

    if (results)
      return message.reply(
        emoji.denyEmoji + ` **${target.tag}** is already a bot staff. What are you trying to do?`
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
You are attempting to make **${target.tag}** a bot staff.
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
              await new botStaffSchema({
                userId,
                lastUsername,
              }).save();
            } finally {
              await interaction.message.edit({
                content: `You've made your choice to make **${target.tag}** a bot staff.\nOperation complete.`,
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
