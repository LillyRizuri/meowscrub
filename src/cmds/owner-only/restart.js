const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");

const confirmId = "confirmRestart";
const abortId = "cancelRestart";

module.exports = class RestartCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "restart",
      aliases: ["reboot"],
      group: "owner-only",
      memberName: "reboot",
      description: "Restart me in case of emergencies.",
      details: "Only the bot owner(s) may use this command.",
      hidden: true,
    });
  }

  async run(message) {
    if (!this.client.isOwner(message.author))
      return message.reply(
        "<:scrubred:797476323169533963> THIS COMMAND IS VERY DANGEROUS AND IT WILL MAKE THE CLIENT REBOOT.\nTHIS IS NO JOKE."
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
The entire client seesion will restart.      
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
              .message.edit(
                "*Restarted the client. Should be up at anytime now.*",
                rowEdit
              );
            await collected.first().reply.defer();
          } finally {
            this.client.destroy();
            await this.client.login(process.env.TOKEN);
          }
        } else if (collected.first().id === abortId) {
          await collected.first().message.edit("Operation aborted.", rowEdit);
          await collected.first().reply.defer();
        }
      })
      .catch(() => {
        message.channel.send(
          `${message.author}, No reaction after 30 seconds, operation aborted.`
        );
      });
  }
};
