const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const botStaffSchema = require("../../models/bot-staff-schema");

const { embedcolor } = require("../../assets/json/colors.json");
const checkMark = "<:scrubgreenlarge:797816509967368213>";
const cross = "<:scrubredlarge:797816510579998730>";

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
      examples: ["blacklist 693832549943869493"],
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
    } else if (results) {
      const confirmationEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Initiated by ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        ).setDescription(`
You will attempt to remove **${target.tag}** from the bot staff team.
Please confirm your choice by reacting to a check mark or a cross to abort.     
        `);
      const msg = await message.reply(confirmationEmbed);
      await msg.react(checkMark);
      await msg.react(cross);

      msg
        .awaitReactions(
          (reaction, user) =>
            user.id == message.author.id &&
            (reaction.emoji.name == "scrubgreenlarge" ||
              reaction.emoji.name == "scrubredlarge"),
          { max: 1, time: 30000 }
        )
        .then(async (collected) => {
          if (collected.first().emoji.name == "scrubgreenlarge") {
            try {
              await message.channel.send(
                `You've made your choice to remove **${target.tag}** from the bot staff team.\nOperation complete.`
              );
            } finally {
              await botStaffSchema.findOneAndDelete({
                userId,
              });
            }
          } else message.channel.send("Operation aborted.");
        })
        .catch(() => {
          message.channel.send(
            "No reaction after 30 seconds, operation aborted."
          );
        });
    }
  }
};
