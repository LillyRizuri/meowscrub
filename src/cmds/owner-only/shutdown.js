const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");
const checkMark = "<:scrubgreenlarge:797816509967368213>";
const cross = "<:scrubredlarge:797816510579998730>";

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
      hidden: true
    });
  }

  async run(message) {
    if (!this.client.isOwner(message.author))
      return message.reply(
        "<:scrubred:797476323169533963> THIS COMMAND IS VERY DANGEROUS AND IT WILL MAKE THE CLIENT SHUT DOWN.\nTHIS IS NO JOKE."
      );

    const confirmationEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(
        `Initiated by ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      ).setDescription(`
The entire client seesion will be destroyed.
Please confirm with a check mark or with a red cross.        
        `);
    message.reply(confirmationEmbed).then((msg) => {
      msg.react(checkMark);
      setTimeout(() => {
        msg.react(cross);
      }, 750);

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
              await message.channel.send("*The client has been put to rest.*");
            } finally {
              process.exit();
            }
          } else message.channel.send("Operation canceled. Phew.");
        })
        .catch(() => {
          message.channel.send(
            "No reaction after 30 seconds, operation canceled."
          );
        });
    });
  }
};
