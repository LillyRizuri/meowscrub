const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const blacklistSchema = require("../../models/user-blacklist-schema");

const { embedcolor } = require("../../assets/json/colors.json");
const checkMark = "<:scrubgreenlarge:797816509967368213>";
const cross = "<:scrubredlarge:797816510579998730>";

module.exports = class UserBlacklistCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "blacklist",
      aliases: ["addblacklist", "botban"],
      group: "utility",
      memberName: "blacklist",
      description: "Blacklist an user from using my stuff.",
      details: "Only the bot owner(s) may use this command.",
      argsType: "single",
      format: "<userId>",
      examples: ["blacklist 693832549943869493"],
    });
  }

  async run(message, args) {
    if (this.client.isOwner(message.author) === false)
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
          "<:scrubred:797476323169533963> Why do you want to lock from your bot yourself? Sigh..."
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

    const results = await blacklistSchema.findOne({
      userId,
    });

    if (results) {
      return message.reply(
        `**${target.tag}** has already been blacklisted. What are you trying to do?`
      );
    } else {
      const confirmationEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Initiated by ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        ).setDescription(`
You will attempt to blacklist **${target.tag}**.
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
                `You've made your choice to blacklist **${target.tag}**.\nOperation complete.`
              );
            } finally {
              await new blacklistSchema({
                userId,
              }).save();
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
