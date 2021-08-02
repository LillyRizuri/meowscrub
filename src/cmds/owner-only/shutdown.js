const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");

const confirmId = "confirmShutdown";
const abortId = "cancelShutdown";

module.exports = class ShutdownCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "shutdown",
      aliases: ["destroy", "terminate", "poweroff"],
      group: "owner-only",
      memberName: "shutdown",
      description: "Shut the actual bot down. No joke.",
      details: "Only the bot owner(s) may use this command.",
      clientPermissions: ["EMBED_LINKS"],
      hidden: true,
    });
  }

  async run(message) {
    if (!this.client.isOwner(message.author))
      return message.reply(
        "<:scrubred:797476323169533963> THIS COMMAND IS VERY DANGEROUS AND IT WILL MAKE THE CLIENT SHUT DOWN.\nTHIS IS NO JOKE."
      );

    const confirmBtn = new disbut.MessageButton()
      .setStyle("green")
      .setLabel("Confirm")
      .setID(confirmId);

    const abortBtn = new disbut.MessageButton()
      .setStyle("red")
      .setLabel("Abort")
      .setID(abortId);

    const row = new disbut.MessageActionRow().addComponents([
      confirmBtn,
      abortBtn,
    ]);

    const msg = await message.reply(
      `
The entire client seesion will be destroyed.  
Please confirm your choice by clicking one of the buttons below.    
      `,
      row
    );
    const filter = (button) => button.clicker.user.id === message.author.id;

    msg
      .awaitButtons(filter, { max: 1, time: 30000 })
      .then(async (collected) => {
        const confirmBtnEdit = new disbut.MessageButton()
          .setStyle("green")
          .setLabel("Confirm")
          .setID(confirmId)
          .setDisabled();

        const abortBtnEdit = new disbut.MessageButton()
          .setStyle("red")
          .setLabel("Abort")
          .setID(abortId)
          .setDisabled();

        const rowEdit = new disbut.MessageActionRow().addComponents([
          confirmBtnEdit,
          abortBtnEdit,
        ]);

        if (collected.first().id === confirmId) {
          try {
            await collected
              .first()
              .message.edit("*The client has been put to rest.*", rowEdit);
            await collected.first().reply.defer();
          } finally {
            process.exit();
          }
        } else if (collected.first().id === abortId) {
          await collected
            .first()
            .message.edit("Operation aborted. Phew.", rowEdit);
          collected.first().reply.defer();
        }
      })
      .catch(() => {
        message.channel.send(
          `${message.author}, No reaction after 30 seconds, operation aborted.`
        );
      });
  }
};
