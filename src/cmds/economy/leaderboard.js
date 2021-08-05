const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const economySchema = require("../../models/economy-schema");

const { embedcolor } = require("../../assets/json/colors.json");

module.exports = class LeaderboardCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      aliases: ["lb", "top", "rich"],
      group: "economy",
      memberName: "leaderboard",
      description: "Check 1op 10 richest members in the leaderboard.",
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message) {
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
          `**${i + 1}.** **¢${v.bal.toLocaleString()}** • ${
            this.client.users.cache.get(v.id).tag
          }`
      )
      .join("\n");

    if (collection.size === 0) leaderboardMap = "There's nothing here :(";

    const leaderboardEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`Top 10 richest members in ${message.guild.name}`)
      .setDescription(leaderboardMap)
      .setFooter(
        "this is WALLETS, not net worth"
      );
    message.channel.send(leaderboardEmbed);
  }
};
