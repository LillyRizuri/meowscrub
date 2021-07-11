const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green, embedcolor } = require("../../assets/json/colors.json");

module.exports = class BanCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "ban",
      group: "moderation",
      memberName: "ban",
      description: "Ban a member in the current guild. Yes.",
      argsType: "multiple",
      format: "<@user/userID> [reason]",
      examples: ["ban @frockles not complying to the rules"],
      clientPermissions: ["BAN_MEMBERS", "EMBED_LINKS"],
      userPermissions: ["BAN_MEMBERS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    if (!args[0])
      return message.reply(
        "<:scrubnull:797476323533783050> Who do you want to ban? Get it right."
      );

    const guild = this.client.guilds.cache.get(message.guild.id);
    let reason;
    let target;

    try {
      target =
        message.mentions.users.first() ||
        (await this.client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What is this ID. Explain or begone."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Banning yourself? Keep dreaming."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Banning myself? Why?"
        );
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        "<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 200 characters."
      );

    if (args[1]) {
      reason = reasonMessage;
    } else {
      reason = "No reason provided.";
    }

    const user = message.guild.members.cache.get(target.id);
    if (guild.members.resolve(target.id)) {
      if (!user.bannable)
        return message.reply(
          "<:scrubred:797476323169533963> How the heck can I ban the user you specified, ya bafoon?"
        );

      const dmReasonEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setTitle(`You were banned in ${message.guild.name}.`)
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
        .setFooter("Sorry. Can't help out.")
        .setTimestamp();
      await user.send(dmReasonEmbed).catch(() => {
        message.channel.send(
          "Can't send the reason to the offender. Maybe they have their DM disabled."
        );
      });
    }

    user.ban({ days: 1, reason: `From ${message.author.tag}: ${reason}` });

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
      .setFooter("well this is e")
      .setTimestamp();
    message.channel.send(banConfirmEmbed);
  }
};
