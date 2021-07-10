const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");
const settingsSchema = require("../../models/settings-schema");
const mutedSchema = require("../../models/muted-schema");

module.exports = class MuteCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "mute",
      aliases: ["shut"],
      group: "moderation",
      memberName: "mute",
      description: "Mute someone in the current guild. No timed mute yet.",
      argsType: "multiple",
      format: "<@user/userID> [reason]",
      examples: ["mute @frockles attempting to annoy members"],
      clientPermissions: ["MANAGE_ROLES", "EMBED_LINKS"],
      userPermissions: ["MANAGE_ROLES"],
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
        "<:scrubnull:797476323533783050> There's no one for me to mute. Do something."
      );

    let reason;
    let member;

    try {
      member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);
    } catch (err) {
      return message.reply(
        "<:scrubred:797476323169533963> What is this ID. Explain or you *gon*."
      );
    }

    switch (member.user) {
      case message.author:
        return message.reply(
          "<:scrubred:797476323169533963> Muting yourself? Refrain yourself from doing anything then."
        );
      case this.client.user:
        return message.reply(
          "<:scrubred:797476323169533963> Muting myself? What the..."
        );
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 1000)
      return message.reply(
        "<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 1000 characters."
      );

    if (reasonMessage) {
      reason = reasonMessage;
    } else {
      reason = "No reason provided.";
    }

    const settingsOutput = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (!settingsOutput || !settingsOutput.muteRole)
      return message.reply(
        "<:scrubred:797476323169533963> There's no muted role set in this server.\nPlease set one using the `muterole` command."
      );

    const mutedRole = message.guild.roles.cache.find(
      (e) => e.id === settingsOutput.muteRole
    );

    if (!mutedRole)
      return message.reply(
        "<:scrubred:797476323169533963> The muted role was set, but couldn't be found anywhere.\nMaybe the role got deleted?"
      );

    if (member.roles.cache.has(mutedRole.id))
      return message.reply(
        `<:scrubred:797476323169533963> **${member.user.tag}** is already muted.`
      );

    await member.roles.add(
      mutedRole,
      `Operation done by ${message.author.tag}`
    );

    const results = await mutedSchema.findOne({
      guildId: message.guild.id,
    });

    if (results) {
      results.users.push(member.id);
      results.save();
    } else if (!results) {
      await new mutedSchema({
        guildId: message.guild.id,
        users: member.id,
      }).save();
    }

    const muteSuccessEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Successfully muted **${member.user.tag}**.\nPlease unmute by using the bot's unmute command. If you remove it manually, the role would persist if the target joins back.`
      )
      .addFields(
        {
          name: "Performed By",
          value: `${message.author.tag} (${message.author.id})`,
        },
        {
          name: "Reason for Muting",
          value: reason,
        }
      )
      .setFooter("interesting")
      .setTimestamp();
    message.channel.send(muteSuccessEmbed);
  }
};
