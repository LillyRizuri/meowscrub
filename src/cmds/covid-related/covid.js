const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const covid = require("covidtracker");
const fetch = require("node-fetch");

const { red, embedcolor } = require("../../assets/json/colors.json");

Object.defineProperty(String.prototype, "toProperCase", {
  value: function () {
    return this.replace(
      /([^\W_]+[^\s-]*) */g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
});

module.exports = class CovidCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "covid",
      aliases: ["corona"],
      group: "covid-related",
      memberName: "covid",
      argsType: "single",
      description:
        "Display stats about COVID-19 globally, or for a specified country.",
      format: "[country]",
      examples: ["covid", "covid usa"],
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

    if (!args) {
      message.channel.send("Retrieving Informations, I guess...");

      const totalStats = await covid.getAll();
      const updatedTime = new Date(totalStats.updated).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      const globalCasesEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor("Coronavirus Stats")
        .addFields(
          {
            name: "Confirmed Cases",
            value: `**${totalStats.cases.toLocaleString()}**`,
            inline: true,
          },
          {
            name: "Today Cases",
            value: `+${totalStats.todayCases.toLocaleString()}`,
            inline: true,
          },
          {
            name: "Today Deaths",
            value: `+${totalStats.todayDeaths.toLocaleString()}`,
            inline: true,
          },
          {
            name: "Active",
            value: totalStats.active.toLocaleString(),
            inline: true,
          },
          {
            name: "Recovered",
            value: `${totalStats.recovered.toLocaleString()} (${(
              (totalStats.recovered / totalStats.cases) *
              100
            ).toFixed(2)}%`,
            inline: true,
          },
          {
            name: "Deaths",
            value: `${totalStats.deaths.toLocaleString()} (${(
              (totalStats.deaths / totalStats.cases) *
              100
            ).toFixed(2)}%)`,
            inline: true,
          },
          {
            name: "Tests",
            value: totalStats.tests.toLocaleString(),
            inline: true,
          },
          {
            name: "Cases Per Mil.",
            value: totalStats.casesPerOneMillion.toLocaleString(),
            inline: true,
          },
          {
            name: "Deaths Per Mil.",
            value: totalStats.deathsPerOneMillion.toLocaleString(),
            inline: true,
          }
        )
        .setImage(
          `https://xtrading.io/static/layouts/qK98Z47ptC-embed.png?newest=${Date.now()}`
        )
        .setFooter(`Last Updated: ${updatedTime}`);
      message.channel.send(globalCasesEmbed);
    } else {
      try {
        message.channel.send("Retrieving Informations, I guess...");

        let countryInput = args.toProperCase();
        if (countryInput.toLowerCase() == "netherlands") countryInput = "nl";
        if (countryInput.toLowerCase() == "laos")
          countryInput = "Lao People's Democratic Republic";
        const country = await covid.getCountry({ country: countryInput });

        let wikiName;
        const wikiAliases = {
          "S. Korea": "South Korea",
          UK: "United Kingdom",
          USA: "United States",
        };

        const thePrefixedContries = ["United States", "Netherlands"];

        if (wikiAliases[country.country]) {
          wikiName = wikiAliases[country.country];
        } else {
          wikiName = country.country;
        }

        let wikiImage = "";
        if (country.country == "USA") {
          wikiImage = `https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/COVID-19_Outbreak_Cases_in_the_United_States_%28Density%29.svg/640px-COVID-19_Outbreak_Cases_in_the_United_States_%28Density%29.svg.png?1588686006705?newest=${Date.now()}`;
        } else {
          const WikiPage = await fetch(
            `https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_${
              thePrefixedContries.includes(wikiName) ? "the_" : ""
            }${wikiName
              .replace(" ", "_")
              .replace(" ", "_")
              .replace(" ", "_")
              .replace(" ", "_")
              .replace(" ", "_")
              .replace(" ", "_")
              .replace(" ", "_")
              .replace(" ", "_")}`
          ).then((res) => res.text());
          const ImageRegex = /<meta property="og:image" content="([^<]*)"\/>/;
          const ImageLink = ImageRegex.exec(WikiPage);
          let imageLink;
          if (ImageLink) imageLink = ImageLink[1];
          if (imageLink) imageLink += `?newest=${Date.now()}`;
          wikiImage = imageLink;
        }

        const updatedTime = new Date(country.updated).toLocaleDateString(
          "en-US",
          dateTimeOptions
        );

        const setCountryEmbed = new Discord.MessageEmbed()
          .setColor(embedcolor)
          .setAuthor(country.country)
          .addFields(
            {
              name: "Confirmed Cases",
              value: `**${country.cases.toLocaleString()}**`,
              inline: true,
            },
            {
              name: "Today Cases",
              value: `+${country.todayCases.toLocaleString()}`,
              inline: true,
            },
            {
              name: "Today Deaths",
              value: `+${country.todayDeaths.toLocaleString()}`,
              inline: true,
            },
            {
              name: "Active",
              value: `${country.active.toLocaleString()} (${(
                (country.active / country.cases) *
                100
              ).toFixed(2)}%)`,
              inline: true,
            },
            {
              name: "Recovered",
              value: `${country.recovered.toLocaleString()} (${(
                (country.recovered / country.cases) *
                100
              ).toFixed(2)}%)`,
              inline: true,
            },
            {
              name: "Deaths",
              value: `${country.deaths.toLocaleString()} (${(
                (country.deaths / country.cases) *
                100
              ).toFixed(2)}%)`,
              inline: true,
            },
            {
              name: "Tests",
              value: country.tests.toLocaleString(),
              inline: true,
            },
            {
              name: "Cases Per Mil.",
              value: country.casesPerOneMillion.toLocaleString(),
              inline: true,
            },
            {
              name: "Deaths Per Mil.",
              value: country.deathsPerOneMillion.toLocaleString(),
              inline: true,
            }
          )
          .setThumbnail(
            `https://www.countryflags.io/${
              require("../../assets/json/countries_abbreviation.json")[
                country.country
              ]
            }/flat/64.png`
          )
          .setFooter(`Last Updated: ${updatedTime}`);
        if (wikiImage) setCountryEmbed.setImage(wikiImage);
        message.channel.send(setCountryEmbed);
      } catch (err) {
        const noResultsEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            `
<:scrubred:797476323169533963> No fetched information for your specified country. It can be due to:
**+ The country does not exist.**
**+ It was typed incorrectly.**
**+ Or the country has no confirmed cases.**
`
          )
          .setFooter("bruh")
          .setTimestamp();
        return message.reply(noResultsEmbed);
      }
    }
  }
};
