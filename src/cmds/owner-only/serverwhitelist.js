const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");
const guildBlacklistSchema = require("../../models/guild-blacklist-schema");

const confirmId = "confirmGuildWhitelist";
const abortId = "cancelGuildWhitelist";

module.exports = class ServerBlacklistRemoveCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "guild-whitelist",
      aliases: ["server-whitelist", "server-unban"],
      group: "owner-only",
      memberName: "server-whitelist",
      description: "Whitelist a server from inviting me",
      argsType: "single",
      format: "<guildId>",
      examples: ["serverunblacklist 692346925428506777"],
      clientPermissions: ["EMBED_LINKS"],
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

    const guildId = args;

    const results = await guildBlacklistSchema.findOne({
      guildId,
    });

    if (!results)
      return message.reply(
        `The "guild" with this ID: **${guildId}** hasn't been blacklisted. What are you trying to do?`
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
You will attempt to whitelist this guild with this ID: **${guildId}**.  
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
              await guildBlacklistSchema.findOneAndDelete({
                guildId,
              });
            } finally {
              await collected
                .first()
                .message.edit(
                  "You've made your choice to whitelist **that following guild.**.\nOperation complete.",
                  rowEdit
                );
            }
            break;
          case abortId:
            await collected.first().message.edit("Operation aborted.", rowEdit);
            break;
        }

        collected.first().reply.defer();
      })
      .catch(() => {
        message.channel.send(
          `${message.author}, No reaction after 30 seconds, operation aborted.`
        );
      });
  }
};
