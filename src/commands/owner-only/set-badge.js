const Discord = require("discord.js");

const botStaffSchema = require("../../models/bot-staff-schema");
const globalChatSchema = require("../../models/global-chat-schema");

const confirmId = "confirmAddBadge";
const abortId = "cancelAddBadge";

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["set-badge", "add-badge"],
  memberName: "set-badge",
  group: "owner-only",
  description: "Set a custom badge for an user in Global Chat.",
  details: "Only the bot owner(s) and bot staff(s) may use this command.",
  format: "<@user | userID> <customEmojiName>",
  examples: ["set-badge 693832549943869493 :what:"],
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

    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " You need a valid User ID in order to continue."
      );

    if (!args[1])
      return message.reply(
        emoji.missingEmoji +
          " You need to provide a valid custom emoji in order to proceed."
      );

    let target;

    try {
      target =
        message.mentions.users.first() || (await client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + " What is this ID. Please explain."
      );
    }

    if (target === client.user)
      return message.reply(
        emoji.denyEmoji + " You can't give me a badge. What are you thinking?"
      );

    if (target.bot)
      return message.reply(
        emoji.denyEmoji + " Why do you even bother giving bots badge?"
      );

    const userId = target.id;

    const gcInfo = await globalChatSchema.findOne({
      userId,
    });

    if (!gcInfo)
      return message.reply(
        emoji.denyEmoji +
          ` **${target.tag}** hasn't signed up for Global Chat yet.`
      );

    const parsedEmoji = Discord.Util.parseEmoji(args[1]);
    if (!parsedEmoji.id)
      return message.reply(emoji.denyEmoji + "That's NOT a valid emoji.");

    const customBadge = args[1];

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
You are attempting to give **${target.tag}** this badge: ${customBadge}.        
Make sure that I can access that emoji, and please confirm your choice by clicking one of the buttons below.
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
              await globalChatSchema.findOneAndUpdate(
                {
                  userId,
                },
                {
                  customBadge,
                }
              );
            } finally {
              await interaction.message.edit({
                content: `You've made your choice to give **${target.tag}** this badge: ${customBadge}.\nOperation complete.`,
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
