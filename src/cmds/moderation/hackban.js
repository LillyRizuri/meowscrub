const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");

module.exports = class HackBanCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "hackban",
      group: "moderation",
      memberName: "hackban",
      description: "Ban a member outside a guild. That's even better.",
      argsType: "multiple",
      format: "<userID> [reason]",
      examples: ["hackban @frockles illegal stuff spotted"],
      clientPermissions: ["BAN_MEMBERS", "ADMINISTRATOR"],
      userPermissions: ["BAN_MEMBERS", "ADMINISTRATOR"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const userId = args[0];
    let reason;

    if (message.mentions.users.first())
      return message.reply(
        `<:scrubred:797476323169533963> Use \`${message.guild.commandPrefix}ban\` or something if you want to ban using mentions.`
      );

    if (!userId || isNaN(userId))
      return message.reply(
        "<:scrubnull:797476323533783050> Who do you want to ban outside the server? Get it right."
      );

    switch (userId) {
      case message.author.id:
        return message.reply(
          "<:scrubred:797476323169533963> Banning yourself with your ID? Keep dreaming."
        );
      case this.client.user.id:
        return message.reply(
          "<:scrubred:797476323169533963> Banning myself? Why?"
        );
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 1000)
      return message.reply(
        "<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 1000 characters."
      );

    if (args[1]) {
      reason = args.slice(1).join(" ");
    } else {
      reason = "No reason provided.";
    }

    this.client.users
      .fetch(userId)
      .then(async (target) => {
        const user = message.guild.members.cache.get(target.id);

        await user.ban(target.id, {
          days: 1,
          reason: `From ${message.author.tag}: ${reason}`,
        });
        const banConfirmEmbed = new Discord.MessageEmbed()
          .setColor(green)
          .setDescription(
            `<:scrubgreen:797476323316465676> Successfully banned **${target.tag}**.`
          )
          .addFields(
            {
              name: "Performed By",
              value: `${message.author.tag} (${message.author.id})`,
            },
            {
              name: "Reason for Banning",
              value: reason,
            }
          )
          .setFooter("well this is too e")
          .setTimestamp();
        message.channel.send(banConfirmEmbed);
      })
      .catch(() => {
        return message.reply(
          "<:scrubred:797476323169533963> What is that user? God heckaroo."
        );
      });
  }
};
