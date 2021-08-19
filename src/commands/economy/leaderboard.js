const Discord = require("discord.js");

const economySchema = require("../../models/economy-schema");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["leaderboard", "lb", "top", "rich"],
  memberName: "leaderboard",
  group: "economy",
  description: "Check top 10 richest members in the leaderboard.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message) => {
    const collection = new Discord.Collection();
    message.channel.send("Please wait...");
    await Promise.all(
      message.guild.members.cache.map(async (member) => {
        const id = member.id;
        let bal;
        const results = await economySchema.findOne({
          userId: member.id,
        });
        if (results) bal = results.coins;
        else if (!results) bal = 0;
        return bal !== 0
          ? collection.set(id, {
              id,
              bal,
            })
          : null;
      })
    );

    const data = collection.sort((a, b) => b.bal - a.bal).first(10);
    let leaderboardMap = data
      .map(
        (v, i) =>
          `#${i + 1} • ${client.users.cache.get(v.id).tag}\n   > ¢${v.bal.toLocaleString()}`
      )
      .join("\n");

    if (collection.size === 0) leaderboardMap = "There's nothing here :(";

    const leaderboardEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`Top 10 richest members in ${message.guild.name}`)
      .setDescription(`\`\`\`css\n${leaderboardMap}\`\`\``)
      .setFooter("this is WALLETS, not net worth");
    message.channel.send({ embeds: [leaderboardEmbed] });
  },
};
