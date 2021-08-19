const Discord = require("discord.js");
const covid = require("covidtracker");

const emoji = require("../../assets/json/tick-emoji.json");
const { red } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["cprovince", "covidprovince"],
  memberName: "cprovince",
  group: "covid",
  description: "Display stats about COVID-19 in a specified province.",
  format: "<countryName> <provinceName>",
  examples: ["cprovince canada ontario"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  callback: async (client, message, args) => {
    const dateTimeOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    };

    if (!args[0] || !args[1])
      return message.reply(
        emoji.missingEmoji +
          " You must provide a country name, and then the province's name."
      );

    message.channel.send("🔍 **Retrieving Data, I guess...**");

    const country = args[0].toProperCase();
    const province = args.slice(1).join(" ").toProperCase();

    try {
      const prov = await covid.getJHU({ country, province });
      const obj = prov[0];
      const stats = obj.stats;

      const updatedTime = new Date(obj.updatedAt).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      console.log(stats);

      // const recovered = `${stats.recovered.toLocaleString()} (${(
      //   (stats.recovered / stats.confirmed) *
      //   100
      // ).toFixed(2)}%)`;

      // "• Recovered: \`${recovered}\`";

      const deaths = `${stats.deaths.toLocaleString()} (${(
        (stats.deaths / stats.confirmed) *
        100
      ).toFixed(2)}%)`;

      const covidProvinceEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`${obj.province}, ${obj.country}`)
        .setDescription(
          `
• Confirmed Cases: \`${stats.confirmed.toLocaleString()}\`
• Deaths: \`${deaths}\`
        `
        )
        .setFooter(`Last Updated: ${updatedTime}`);
      message.channel.send({ embeds: [covidProvinceEmbed] });
    } catch (err) {
      const noResultEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          emoji.denyEmoji +
            ` Couldn't find the province you provided. Either:
**+ The province does not exist.**
**+ It was typed incorrectly.**
`
        )
        .setFooter("check again.")
        .setTimestamp();
      message.reply({ embeds: [noResultEmbed] });
    }
  },
};
