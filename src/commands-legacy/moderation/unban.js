const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");
const { green } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["unban"],
  memberName: "unban",
  group: "moderation",
  description: "Unban a member in the current server.",
  format: "<@user | userID> [reason]",
  examples: ["unban @frockles appealed"],
  clientPermissions: ["BAN_MEMBERS", "EMBED_LINKS"],
  userPermissions: ["BAN_MEMBERS"],
  cooldown: 3,
  singleArgs: false,
  guildOnly: true,
  callback: async (client, message, args) => {
    if (!args[0])
      return message.reply(
        emoji.missingEmoji + " Who do you want to unban? Get it right."
      );

    let reason = "";
    let target;

    try {
      target =
        message.mentions.users.first() || (await client.users.fetch(args[0]));
    } catch (err) {
      return message.reply(
        emoji.denyEmoji + " What is this ID. Explain or begone."
      );
    }

    switch (target) {
      case message.author:
        return message.reply(emoji.denyEmoji + " Unbanning yourself? What?");
      case client.user:
        return message.reply(
          emoji.denyEmoji + " There's no reason to unban me."
        );
    }

    const reasonMessage = args.slice(1).join(" ");

    if (reasonMessage.length > 200)
      return message.reply(
        emoji.denyEmoji +
          " Consider lowering your reason's length to be just under 200 characters."
      );

    if (args[1]) {
      reason = reasonMessage;
    } else {
      reason = "No reason provided.";
    }

    const bansFetched = await message.guild.bans.fetch();
    const isBanned = bansFetched.some((banned) => banned.user.id === target.id);

    if (!isBanned)
      return message.reply(
        emoji.denyEmoji + " That person hasn't been banned from this server."
      );

    await message.guild.members.unban(
      target.id,
      `From ${message.author.tag}: ${reason}`
    );

    const unbanConfirmEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        emoji.successEmoji + ` Successfully unbanned **${target.tag}**.`
      )
      .addFields(
        {
          name: "Performed By",
          value: `${message.author.tag} (${message.author.id})`,
        },
        {
          name: "Reason for Unbanning",
          value: reason,
        }
      )
      .setFooter("hmmmmmm")
      .setTimestamp();
    await message.channel.send({ embeds: [unbanConfirmEmbed] });
  },
};
