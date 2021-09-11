const Discord = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  aliases: ["invite", "vote"],
  memberName: "invite",
  group: "misc",
  description: "Generate an invite link to invite me to your server.",
  cooldown: 5,
  callback: async (client, message) => {
    const resJson = await fetch(
      `https://top.gg/api/bots/${client.user.id}/check?userId=${message.author.id}`,
      {
        headers: {
          Authorization: process.env.TOPGG_TOKEN,
        },
      }
    ).then((res) => res.json());

    const clientInvite = client.generateInvite({
      scopes: ["applications.commands", "bot"],
      // eslint-disable-next-line no-undef
      permissions: BigInt(258171333879),
    });

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setStyle("LINK")
        .setURL(clientInvite)
        .setLabel("Click here to invite me!"),
      new Discord.MessageButton()
        .setStyle("LINK")
        .setURL(`https://top.gg/bot/${client.user.id}/vote`)
        .setLabel("Vote for me!")
    );

    let content = "Generated an invite link!";

    switch (resJson.voted) {
      case 0:
        content += " And you can vote for me too!";
        break;
      default:
        row.components[1].disabled = true;
        break;
    }

    message.channel.send({
      content,
      components: [row],
    });
  },
};
