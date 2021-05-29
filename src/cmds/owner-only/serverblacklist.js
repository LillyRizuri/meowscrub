const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const guildBlacklistSchema = require("../../models/guild-blacklist-schema");

const { embedcolor } = require("../../assets/json/colors.json");
const checkMark = "<:scrubgreenlarge:797816509967368213>";
const cross = "<:scrubredlarge:797816510579998730>";

module.exports = class ServerBlacklistCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "server-blacklist",
      aliases: ["guild-blacklist", "server-ban"],
      group: "owner-only",
      memberName: "server-blacklist",
      description: "Blacklist a server from inviting me.",
      details:
        "Use [--force] to skip guild checking. Good for blacklisting a guild that I'm not in.\nOnly the bot owner(s) may use this command.",
      argsType: "multiple",
      format: "<guildId> [--force]",
      examples: [
        "blacklist 692346925428506777",
        "blacklist 692346925428506777 --force",
      ],
      clientPermissions: ["EMBED_LINKS"],
      hidden: true
    });
  }

  async run(message, args) {
    if (!this.client.isOwner(message.author))
      return message.reply(
        "<:scrubred:797476323169533963> Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s)."
      );

    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> You need a valid Guild ID in order to continue."
      );

    let target;
    let guildId;

    if (!args[1]) {
      try {
        target = await this.client.guilds.fetch(args[0]);
      } catch (err) {
        return message.reply(
          "<:scrubred:797476323169533963> What is this ID. Please explain.\nBut if the guild you provided DOES exist, use `--force` alongside with the Guild ID."
        );
      }
      guildId = target.id;
    } else if (args[1] === "--force") {
      guildId = args[0];
    }

    const results = await guildBlacklistSchema.findOne({
      guildId,
    });

    if (results) {
      switch (args[1]) {
        case "--force":
          return message.reply(
            `The guild with this ID: **${guildId}** has already been blacklisted. What are you trying to do?`
          );
        case "":
          return message.reply(
            `**${target.name}** has already been blacklisted. What are you trying to do?`
          );
      }
    } else {
      const confirmationEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Initiated by ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        );
      if (!args[1]) {
        confirmationEmbed.setDescription(`
You will attempt to blacklist this guild: **${target.name}**.
Please confirm your choice by reacting to a check mark or a cross to abort.     
        `);
      } else if (args[1] === "--force") {
        confirmationEmbed.setDescription(`
You will attempt to blacklist this guild: **${guildId}**.
Please confirm your choice by reacting to a check mark or a cross to abort.     
        `);
      }
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
                "You've made your choice to blacklist **that following guild**.\nOperation complete."
              );
            } finally {
              await new guildBlacklistSchema({
                guildId,
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
