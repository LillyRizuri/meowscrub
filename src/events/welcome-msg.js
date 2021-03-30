const Discord = require("discord.js");
const { embedcolor } = require("../assets/json/colors.json");

module.exports = (client) => {
  let welcomeMsgEmbed;
  client.users.fetch(process.env.OWNERID).then(async (user) => {
    authorlol = user.tag;

    welcomeMsgEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(`A message from ${user.tag}`)
      .setTitle(`thank you for adding ${client.user.username} to this server.`)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "Getting Started",
          value: `Use \`${client.commandPrefix}help\` to let the bot provide the full list of commands available. Hope you utilize all commands present in there.`,
        },
        {
          name: "Needing help or get involved in our community?",
          value: `You can join the server right in this [link.](${process.env.DISCORDINVITE})`,
        },
        {
          name: "Adding it to your server?",
          value: `You can be one of the testers and invite the bot with this link: [Here.](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2083911167)`,
        }
      )
      .setFooter("i can only hope for the bot to run smoothly")
      .setTimestamp();
  });

  client.on("guildCreate", (guild) => {
    let channelToSend;

    guild.channels.cache.forEach((channel) => {
      if (
        channel.type === "text" &&
        !channelToSend &&
        channel.permissionsFor(guild.me).has("SEND_MESSAGES")
      )
        channelToSend = channel;
    });

    if (!channelToSend) return;

    channelToSend.send(welcomeMsgEmbed);
  });
};
