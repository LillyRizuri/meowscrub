const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const collection = new Discord.Collection();

const { embedcolor } = require("../../assets/json/colors.json");

const economy = require("../../economy");

module.exports = class LeaderboardCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      aliases: ["lb", "top"],
      group: "economy",
      memberName: "leaderboard",
      description: "Check 1op 10 richest members in the leaderboard.",
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message) {
    if (collection.size === 0) {
      await Promise.all(
        message.guild.members.cache.map(async (member) => {
          const id = member.id;
          const bal = await economy.getCoins(member.id);
          return bal !== 0
            ? collection.set(id, {
                id,
                bal,
              })
            : null;
        })
      );

      setTimeout(() => {
        collection.clear();
      }, 60000);
    }

    const data = collection.sort((a, b) => b.bal - a.bal).first(10);
    let leaderboardMap = data
      .map((v, i) =>
        `**${i + 1}.** ${
          this.client.users.cache.get(v.id).tag
        } • **¢${v.bal.toLocaleString()}**`
      )
      .join("\n");

    if (collection.size === 0) leaderboardMap = "There's nothing here :(";

    const leaderboardEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setTitle(`Richest members in ${message.guild.name}`)
      .setDescription(leaderboardMap)
      .setFooter(
        "this is WALLETS, not net worth, and the data is cached for 1 minute"
      );
    message.channel.send(leaderboardEmbed);
  }
};
