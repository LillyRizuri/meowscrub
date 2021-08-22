const Discord = require("discord.js");

const confirmId = "confirmRestart";
const abortId = "cancelRestart";

module.exports = {
  aliases: ["shutdown", "destroy", "terminate", "poweroff"],
  memberName: "shutdown",
  group: "owner-only",
  description: "Shut the actual client down. No joke.",
  details: "Only the bot owner(s) may use this command.",
  ownerOnly: true,
  guarded: true,
  hidden: true,
  callback: async (client, message) => {
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
The entire client seesion will be destroyed.      
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

        if (interaction.customId === confirmId) {
          try {
            await interaction.message.edit({
              content: "*Successfully shut down the client.*",
              components: [row],
            });
            await interaction.deferUpdate();
          } finally {
            process.exit();
          }
        } else if (interaction.customId === abortId) {
          await interaction.message.edit({
            content: "Operation aborted.",
            components: [row],
          });
          await interaction.deferUpdate();
        }
      })
      .catch(() => {
        message.channel.send(
          `${message.author.toString()}, No reaction after 30 seconds, operation aborted.`
        );
      });
  },
};
