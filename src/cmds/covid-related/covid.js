const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { PaginatedEmbed } = require("embed-paginator");
const covid = require("covidtracker");
const fetch = require("node-fetch");

const { red } = require("../../assets/json/colors.json");

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
      clientPermissions: ["EMBED_LINKS"],
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

    if (!args) {
      message.channel.send("Retrieving Informations, I guess...");

      const totalStats = await covid.getAll();
      const updatedTime = new Date(totalStats.updated).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      const active = `${totalStats.active.toLocaleString()} (${(
        (totalStats.active / totalStats.cases) *
        100
      ).toFixed(2)}%)`;

      const recovered = `${totalStats.recovered.toLocaleString()} (${(
        (totalStats.recovered / totalStats.cases) *
        100
      ).toFixed(2)}%)`;

      const deaths = `${totalStats.deaths.toLocaleString()} (${(
        (totalStats.deaths / totalStats.cases) *
        100
      ).toFixed(2)}%)`;

      const allCasesEmbed = new PaginatedEmbed({
        colours: ["RANDOM"],
        descriptions: [
          `Last Updated: ${updatedTime}\n[Image](https://xtrading.io/static/layouts/qK98Z47ptC-embed.png?newest=${Date.now()})`,
        ],
        fields: [
          {
            name: "Cases",
            value: `
• All Cases: \`${totalStats.cases.toLocaleString()}\`            
• Active Cases: \`${active}\`
• Critical Cases: \`${totalStats.critical.toLocaleString()}\`
            `,
            inline: true,
          },
          {
            name: "Recovered/Deaths/Tests",
            value: `
• Recovered: \`${recovered}\`
• Deaths: \`${deaths}\`
• Tests: \`${totalStats.tests.toLocaleString()}\`
            `,
            inline: true,
          },
          {
            name: "Today",
            value: `
• Today Cases: \`+ ${totalStats.todayCases.toLocaleString()}\`
• Today Recovered: \`+ ${totalStats.todayRecovered.toLocaleString()}\`  
• Today Deaths: \`+ ${totalStats.todayDeaths.toLocaleString()}\`          
            `,
            inline: true,
          },
          {
            name: "Per One Million",
            value: `
• Cases Per Mil: \`${totalStats.casesPerOneMillion.toLocaleString()}\`  
• Deaths Per Mil: \`${totalStats.deathsPerOneMillion.toLocaleString()}\`
• Tests Per Mil: \`${totalStats.testsPerOneMillion.toLocaleString()}\`
• Active Per Mil: \`${totalStats.activePerOneMillion.toLocaleString()}\`
• Recovered Per Mil: \`${totalStats.recoveredPerOneMillion.toLocaleString()}\`
• Critical Per MIl: \`${totalStats.criticalPerOneMillion.toLocaleString()}\`
            `,
            inline: true,
          },
        ],
        duration: 60 * 1000,
        itemsPerPage: 2,
        paginationType: "field",
      }).setAuthor("Coronavirus Worldwide Stats");
      allCasesEmbed.send(message.channel);
    } else {
      try {
        message.channel.send("Retrieving Informations, I guess...");

        let countryInput = args.toProperCase();
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

        const active = `${country.active.toLocaleString()} (${(
          (country.active / country.cases) *
          100
        ).toFixed(2)}%)`;

        const recovered = `${country.recovered.toLocaleString()} (${(
          (country.recovered / country.cases) *
          100
        ).toFixed(2)}%)`;

        const deaths = `${country.deaths.toLocaleString()} (${(
          (country.deaths / country.cases) *
          100
        ).toFixed(2)}%)`;

        let lastUpdated = `Last Updated: ${updatedTime}`;
        if (wikiImage) lastUpdated = `${lastUpdated}\n[Image](${wikiImage})`;

        const definedCountryEmbed = new PaginatedEmbed({
          colours: ["RANDOM"],
          descriptions: [lastUpdated],
          fields: [
            {
              name: "Cases",
              value: `
• All Cases: \`${country.cases.toLocaleString()}\`
• Active Cases: \`${active}\`
• Critical Cases: \`${country.critical.toLocaleString()}\`
              `,
              inline: true,
            },
            {
              name: "Recovered/Deaths/Tests",
              value: `
• Recovered: \`${recovered}\`
• Deaths: \`${deaths}\`
• Tests: \`${country.tests.toLocaleString()}\`              
              `,
              inline: true,
            },
            {
              name: "Today",
              value: `
• Today Cases: \`+ ${country.todayCases.toLocaleString()}\`
• Today Recovered: \`+ ${country.todayRecovered.toLocaleString()}\`  
• Today Deaths: \`+ ${country.todayDeaths.toLocaleString()}\`         
              `,
              inline: true,
            },
            {
              name: "Per One Million",
              value: `
• Cases Per Mil: \`${country.casesPerOneMillion.toLocaleString()}\`  
• Deaths Per Mil: \`${country.deathsPerOneMillion.toLocaleString()}\`
• Tests Per Mil: \`${country.testsPerOneMillion.toLocaleString()}\`
• Active Per Mil: \`${country.activePerOneMillion.toLocaleString()}\`
• Recovered Per Mil: \`${country.recoveredPerOneMillion.toLocaleString()}\`
• Critical Per MIl: \`${country.criticalPerOneMillion.toLocaleString()}\`
              `,
              inline: true,
            },
          ],
          duration: 60 * 1000,
          itemsPerPage: 2,
          paginationType: "field",
        })
          .setAuthor(`${country.country} - ${country.continent}`)
          .setThumbnail(
            `https://www.countryflags.io/${
              require("../../assets/json/countries-abbreviation.json")[
                country.country
              ]
            }/flat/64.png`
          );
        definedCountryEmbed.send(message.channel);
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
