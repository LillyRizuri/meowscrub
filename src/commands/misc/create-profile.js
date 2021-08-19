const Discord = require("discord.js");
const emoji = require("../../assets/json/tick-emoji.json");

const globalChatSchema = require("../../models/global-chat-schema");

module.exports = {
  aliases: ["create-profile"],
  memberName: "create-profile",
  group: "misc",
  description: "Create a profile for Global Chat.",
  cooldown: 5,
  hidden: true,
  callback: async (client, message) => {
    const gcInfo = await globalChatSchema.findOne({
      userId: message.author.id,
    });

    if (gcInfo)
      return message.reply(
        emoji.denyEmoji + " Your profile is already present."
      );

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setStyle("PRIMARY")
        .setCustomId("createProfile")
        .setLabel("Create Your Profile")
    );

    const messageConfirmation = await message.reply({
      content: `
You will get your Global Chat Profile created once you click on the button.
This action is permanent. Click on the button to proceed.      
    `,
      components: [row],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    messageConfirmation
      .awaitMessageComponent({ filter, time: 30000, componentType: "BUTTON" })
      .then(async (interaction) => {
        await new globalChatSchema({
          userId: message.author.id,
          messageCount: 0,
        }).save();

        const rowEdit = new Discord.MessageActionRow().addComponents(
          new Discord.MessageButton()
            .setStyle("SECONDARY")
            .setCustomId("createProfile")
            .setLabel("Create Your Profile")
            .setDisabled()
        );

        await interaction.message.edit({
          content: "Successfully created your profile.",
          components: [rowEdit],
        });

        interaction.deferUpdate();
      })
      .catch(() => {
        message.channel.send(
          `${message.author.toString()}, What took you so long to create your profile?`
        );
      });
  },
};
