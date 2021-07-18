const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");
const botStaffSchema = require("../../models/bot-staff-schema");
const blacklistSchema = require("../../models/user-blacklist-schema");

const confirmId = "confirmBlacklist";
const abortId = "cancelBlacklist";

module.exports = class UserBlacklistCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "blacklist",
      aliases: ["add-blacklist", "bot-ban"],
      group: "owner-only",
      memberName: "blacklist",
      description: "Blacklist an user from using my stuff.",
      details: "Only the bot owner(s) and bot staff(s) may use this command.",
      argsType: "single",
      format: "<userId>",
      examples: ["blacklist 693832549943869493"],
      hidden: true,
    });
  }

  async run(message, args) {
    const isBotStaff = await botStaffSchema.findOne({
      userId: message.author.id,
    });

    // eslint-disable-next-line no-empty
    if (isBotStaff || this.client.isOwner(message.author)) {
    } else {
      return message.reply(
        "<:scrubred:797476323169533963> Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s) and bot staff(s)."
      );
    }

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
          "<:scrubred:797476323169533963> Why do you want to lock from my stuff yourself? Sigh..."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Locking out of my stuff? What the..."
        );
    }

    if (target.bot)
      return message.reply(
        "<:scrubred:797476323169533963> Bot can't even interact with my stuff, and same for me too.\nSo why would you want to try?"
      );

    const userId = target.id;

    const ifTargetStaff = await botStaffSchema.findOne({
      userId,
    });

    if (this.client.isOwner(target) || ifTargetStaff)
      return message.reply(
        "<:scrubred:797476323169533963> Blacklisting a bot owner or a staff? I won't let you."
      );

    const results = await blacklistSchema.findOne({
      userId,
    });

    if (results)
      return message.reply(
        `**${target.tag}** has already been blacklisted. What are you trying to do?`
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
You are attempting to blacklist **${target.tag}**.        
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
              await new blacklistSchema({
                userId,
              }).save();
            } finally {
              await collected
                .first()
                .message.edit(
                  `You've made your choice to blacklist **${target.tag}**.\nOperation complete.`,
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
