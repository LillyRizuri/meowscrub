const Discord = require("discord.js");
const covid = require("covidtracker");

module.exports = {
  aliases: ["ctop", "covidtop"],
  memberName: "ctop",
  group: "covid",
  description: "Displays top 10 countries with the most cases of COVID-19.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  callback: async (client, message) => {
    message.channel.send("🔍 **Fetching top countries...**");

    const sortedCountries = await covid.getCountry({ sort: "cases" });
    let topCountries = "";

    for (let i = 0; i < 10; i++) {
      const country = sortedCountries[i];
      topCountries += `${i + 1}. **${
        country.country
      }**:  ${country.cases.toLocaleString()} Cases - ${country.deaths.toLocaleString()} Deaths - ${country.recovered.toLocaleString()} Recovered\n`;
    }

    const top10Embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor("Top 10 Countries with most cases of COVID-19")
      .setDescription(topCountries)
      .setTimestamp();
    message.channel.send({ embeds: [top10Embed] });
  },
};
