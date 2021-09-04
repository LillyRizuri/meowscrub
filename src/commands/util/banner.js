const Discord = require("discord.js");
const fetch = require("node-fetch");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["banner"],
  memberName: "banner",
  group: "util",
  description: "Return your/someone else's banner.",
  format: "[@user | userID]",
  examples: ["banner", "banner @frockles", "banner 693832549943869493"],
  singleArgs: true,
  cooldown: 5,
  callback: async (client, message, args) => {
    let target;
    try {
      if (!args) {
        target = message.author;
      } else if (args) {
        target =
          message.mentions.users.first() || (await client.users.fetch(args));
      }
    } catch (err) {
      return message.reply(
        emoji.denyEmoji +
          " What are you trying to do with that invalid user ID?"
      );
    }

    message.channel.send("Please wait...");
    let receive = "";
    let banner =
      "https://cdn.discordapp.com/attachments/829722741288337428/834016013678673950/banner_invisible.gif";

    const res = await fetch(`https://discord.com/api/v8/users/${target.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
      },
    });

    if (res.status !== 404) {
      const json = await res.json();
      receive = json["banner"];
    }

    if (receive) {
      const res2 = await fetch(
        `https://cdn.discordapp.com/banners/${target.id}/${receive}.gif`,
        {
          method: "GET",
          headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
          },
        }
      );

      banner = `https://cdn.discordapp.com/banners/${target.id}/${receive}.gif?size=4096`;
      if (res2.status === 415)
        banner = `https://cdn.discordapp.com/banners/${target.id}/${receive}.png?size=4096`;
    } else
      return message.reply(
        emoji.denyEmoji + " Couldn't find any profile banner set up!"
      );

    const bannerEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(`${target.tag}'s Profile Banner`)
      .setImage(banner)
      .setFooter(
        `Requested by ${message.author.tag}`,
        message.author.displayAvatarURL({ dynamic: true })
      );

    message.channel.send({ embeds: [bannerEmbed] });
  },
};
