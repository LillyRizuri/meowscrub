const Discord = require("discord.js");

const confirmId = "confirmRestart";
const abortId = "cancelRestart";

module.exports = {
  aliases: ["restart", "reboot"],
  memberName: "restart",
  group: "owner-only",
  description: "Restart the client in case of emergencies.",
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
The entire client seesion will be restarted.      
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
              content: "*Restarted the client. Should be up at anytime now.*",
              components: [row],
            });
            await interaction.deferUpdate();
          } finally {
            client.destroy();
            await client.login(process.env.TOKEN);
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
