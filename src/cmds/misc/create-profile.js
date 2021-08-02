const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");
const globalChatSchema = require("../../models/global-chat-schema");

const confirmId = "createGCProfile";

module.exports = class CreateGlobalChatProfile extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "create-profile",
      group: "misc",
      memberName: "create-profile",
      description: "Create a profile for Global Chat.",
      throttling: {
        usages: 1,
        duration: 5,
      },
      hidden: true,
    });
  }

  async run(message) {
    const gcInfo = await globalChatSchema.findOne({
      userId: message.author.id,
    });

    if (gcInfo)
      return message.reply(
        "<:scrubred:797476323169533963> Your profile is already present."
      );

    const btn = new disbut.MessageButton()
      .setStyle("blurple")
      .setLabel("Create Your Profile")
      .setID(confirmId);

    const row = new disbut.MessageActionRow().addComponent(btn);

    const messageConfirmation = await message.reply(
      `
You will get your Global Chat Profile created once you click on the button.
This action is permanent. Click on the button to proceed.  
    `,
      row
    );

    const filter = (button) =>
      button.id === confirmId && button.clicker.user.id === message.author.id;

    messageConfirmation
      .awaitButtons(filter, { max: 1, time: 30000 })
      .then(async (collected) => {
        await new globalChatSchema({
          userId: message.author.id,
          messageCount: 0,
        }).save();

        const btnEdit = new disbut.MessageButton()
          .setStyle("blurple")
          .setLabel("Create Your Profile")
          .setID(confirmId)
          .setDisabled();

        const rowEdit = new disbut.MessageActionRow().addComponent(btnEdit);

        await collected
          .first()
          .message.edit("Successfully created your profile.", rowEdit);

        collected.first().reply.defer();
      })
      .catch(() => {
        message.channel.send(
          `${message.author}, What took you so long to create your profile?`
        );
      });
  }
};
