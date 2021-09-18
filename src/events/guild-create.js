const Discord = require("discord.js");
const util = require("../util/util");
const serverBlacklistSchema = require("../models/guild-blacklist-schema");
const { embedcolor } = require("../assets/json/colors.json");

module.exports = {
  name: "guildCreate",
  async execute(guild, client) {
    const botOwner = await client.users.fetch(client.settings.owner[0]);
    const clientInvite = client.generateInvite({
      scopes: ["applications.commands", "bot"],
      // eslint-disable-next-line no-undef
      permissions: BigInt(258171333879),
    });
    const welcomeMsgEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(`A message from ${botOwner.tag}`)
      .setTitle(`thank you for adding ${client.user.username} to this server.`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "Getting Started",
          value: `Use \`${await util.getPrefix(
            guild.id
          )}help\` to let the bot provide the full list of commands available. Hope you utilize all commands present in there.`,
        },
        {
          name: "Needing help or get involved in our community?",
          value: `You can join the server right in this [link.](${process.env.DISCORDINVITE})`,
        },
        {
          name: "Adding it to your server?",
          value: `You can be one of the testers and invite the bot with this link: [Here.](${clientInvite})`,
        }
      )
      .setFooter("i can only hope for the bot to run smoothly")
      .setTimestamp();

    let channelToSend;
    guild.channels.cache.forEach((channel) => {
      if (
        channel.type === "GUILD_TEXT" &&
        !channelToSend &&
        channel.permissionsFor(guild.me).has("SEND_MESSAGES")
      )
        channelToSend = channel;
    });

    const results = await serverBlacklistSchema.findOne({
      guildId: guild.id,
    });

    // eslint-disable-next-line no-empty
    if (!channelToSend) {
    } else if (channelToSend) {
      if (results) {
        await channelToSend.send(
          "This server is blacklisted. Why even bother?"
        );
      } else if (guild.members.cache.filter((m) => m.user.bot).size > 50) {
        await channelToSend.send(
          "This server has too many bots. Please remove any that's unnecessary."
        );
      } else {
        await channelToSend.send({ embeds: [welcomeMsgEmbed] });
      }
    }

    if (results || guild.members.cache.filter((m) => m.user.bot).size > 50)
      await guild.leave();
  },
};
