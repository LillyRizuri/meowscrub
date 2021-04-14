const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { embedcolor } = require("../../assets/json/colors.json");

const economy = require("../../economy");

module.exports = class LeaderboardCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "leaderboard",
      aliases: ["lb"],
      group: "economy",
      memberName: "leaderboard",
      description: "Check the server's economy leaderboard.",
      guildOnly: true,
    });
  }

  async run(message) {
    const collection = new Discord.Collection();

    await Promise.all(
      message.guild.members.cache.map(async (member) => {
        const id = member.id;
        const bal = await economy.getCoinBank(message.guild.id, member.id);
        return bal !== 0
          ? collection.set(id, {
              id,
              bal,
            })
          : null;
      })
    );

    const data = collection.sort((a, b) => b.position - a.position).first(10);
    const leaderboardMap = data.map((v, i) => {
      return `**${i + 1}.** ${this.client.users.cache.get(v.id).tag} • **¢${
        v.bal
      }**`;
    });

    const leaderboardEmbed = new Discord.MessageEmbed()
      .setColor(embedcolor)
      .setAuthor(`Top 10's in ${message.guild.name}`)
      .setDescription(leaderboardMap);
    message.channel.send(leaderboardEmbed);
  }
};
