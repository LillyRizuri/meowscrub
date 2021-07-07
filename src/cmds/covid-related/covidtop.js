const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const covid = require("covidtracker");

module.exports = class TopCovidCasesCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "ctop",
      aliases: ["covidtop"],
      group: "covid-related",
      memberName: "ctop",
      description:
        "Shows the top 10 countries with the most cases of COVID-19.",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    message.channel.send("Fetching top countries...");

    const sortedCountries = await covid.getCountry({ sort: "cases" });
    let topCountries = "";

    for (let i = 0; i < 10; i++) {
      const country = sortedCountries[i];
      topCountries += `${i + 1}. **${country.country}**:  ${
        country.cases
      } Cases - ${country.deaths} Deaths - ${country.recovered} Recovered\n`;
    }

    const top10Embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Top 10 Countries with most cases of COVID-19")
      .setDescription(topCountries)
      .setFooter("certified bruh moment")
      .setTimestamp();
    message.channel.send(top10Embed);
  }
};
