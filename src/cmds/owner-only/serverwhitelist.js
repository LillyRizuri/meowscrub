const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const guildBlacklistSchema = require("../../models/guild-blacklist-schema");

const { embedcolor } = require("../../assets/json/colors.json");
const checkMark = "<:scrubgreenlarge:797816509967368213>";
const cross = "<:scrubredlarge:797816510579998730>";

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
      hidden: true
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
    const guildId = args;

    const results = await guildBlacklistSchema.findOne({
      guildId,
    });

    if (results) {
      const confirmationEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(
          `Initiated by ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        ).setDescription(`
You will attempt to whitelist this guild with this ID: **${guildId}**.
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
                "You've made your choice to whitelist **that following guild.**.\nOperation complete."
              );
            } finally {
              await guildBlacklistSchema.findOneAndDelete({
                guildId,
              });
            }
          } else message.channel.send("Operation aborted.");
        })
        .catch(() => {
          message.channel.send(
            "No reaction after 30 seconds, operation aborted."
          );
        });
    } else {
      return message.reply(
        `**${target.name}** hasn't been blacklisted. What are you trying to do?`
      );
    }
  }
};
