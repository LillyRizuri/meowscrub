const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const covid = require("covidtracker");

const { red, embedcolor } = require("../../assets/json/colors.json");

module.exports = class CovidProvinceCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "cprovince",
      aliases: ["covidprovince"],
      group: "covid-related",
      memberName: "cprovince",
      argsType: "multiple",
      description: "Display stats about COVID-19 in a specified province.",
      format: "<country> <province>",
      examples: ["cprovince canada ontario"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
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
        "<:scrubnull:797476323533783050> You must provide a country and province name. In that order."
      );

    message.channel.send("Retrieving Informations, I guess...");

    const country = args[0].toProperCase();
    const province = args.slice(1).join(" ").toProperCase();

    try {
      const prov = await covid.getJHU({ country, province });
      const obj = prov[0];
      const updatedTime = new Date(obj.updatedAt).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      const covidProvinceEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(`${obj.province}, ${obj.country}`)
        .addFields(
          {
            name: "Confirmed Cases",
            value: `**${obj.stats.confirmed.toLocaleString()}**`,
            inline: true,
          },
          {
            name: "Deaths",
            value: `${obj.stats.deaths.toLocaleString()} (${(
              (obj.stats.deaths / obj.stats.confirmed) *
              100
            ).toFixed(2)}%)`,
            inline: true,
          },
          {
            name: "Recovered",
            value: `${obj.stats.recovered.toLocaleString()} (${(
              (obj.stats.recovered / obj.stats.confirmed) *
              100
            ).toFixed(2)}%)`,
            inline: true,
          }
        )
        .setFooter(`Last Updated: ${updatedTime}`);
      message.channel.send(covidProvinceEmbed);
    } catch (err) {
      const noResultEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          `
<:scrubred:797476323169533963> Couldn't find the province you provided. Either:
**+ The province does not exist.**
**+ It was typed incorrectly.**
`
        )
        .setFooter("check again.")
        .setTimestamp();
      message.reply(noResultEmbed);
    }
  }
};
