const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");
const botStaffSchema = require("../../models/bot-staff-schema");

const confirmId = "removeBotStaff";
const abortId = "cancelRemovingBotStaff";

module.exports = class RemoveBotStaffCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "removebotstaff",
      aliases: ["rmbotstaff"],
      group: "owner-only",
      memberName: "removebotstaff",
      description: "Remove an user who is currently this client's staff.",
      details: "Only the bot owner(s) may use this command.",
      argsType: "single",
      format: "<userId>",
      hidden: true,
    });
  }

  async run(message, args) {
    if (!this.client.isOwner(message.author))
      return message.reply(
        "<:scrubred:797476323169533963> Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s)."
      );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> You need a valid User ID in order to continue."
      );

    let target;

    try {
      target = await this.client.users.fetch(args);
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What is this ID. Please explain."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Sigh... Why are you doing that to yourself."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Making me NOT moderate myself? What the..."
        );
    }

    if (target.bot)
      return message.reply(
        "<:scrubred:797476323169533963> Bot can't even interact with my stuff, and same for me too.\nSo why would you want to try?"
      );

    const userId = target.id;

    const results = await botStaffSchema.findOne({
      userId,
    });

    if (!results) {
      return message.reply(
        `**${target.tag}** is not a bot staff. What are you trying to do?`
      );
    }

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
You are attempting to remove **${target.tag}** from the bot staff team.      
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

        switch (collected.first().id) {
          case confirmId:
            try {
              await botStaffSchema.findOneAndDelete({
                userId,
              });
            } finally {
              await collected
                .first()
                .message.edit(
                  `You've made your choice to remove **${target.tag}** from the bot staff team.\nOperation complete.`,
                  rowEdit
                );
            }
            break;
          case abortId:
            await collected.first().message.edit("Operation aborted.", rowEdit);
            break;
        }

        collected.first().defer();
      })
      .catch(() => {
        message.channel.send(
          `${message.author}, No reaction after 30 seconds, operation aborted.`
        );
      });
  }
};
