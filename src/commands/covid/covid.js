const Discord = require("discord.js");
const { pagination } = require("reconlx");
const covid = require("covidtracker");
const fetch = require("node-fetch");

const emoji = require("../../assets/json/tick-emoji.json");
const { red } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["covid", "corona"],
  memberName: "covid",
  group: "covid",
  description:
    "Display stats about COVID-19 globally, or for a specified country.",
  format: "[countryName]",
  examples: ["covid", "covid usa"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
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

    if (!args) {
      message.channel.send("🔍 **Retrieving Data, I guess...**");

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

      const embeds = [
        new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle("Coronavirus Worldwide Stats")
          .setURL(
            `https://xtrading.io/static/layouts/qK98Z47ptC-embed.png?newest=${Date.now()}`
          )
          .addFields(
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
            }
          )
          .setFooter(`Last Updated: ${updatedTime}`),

        new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle("Coronavirus Worldwide Stats")
          .setURL(
            `https://xtrading.io/static/layouts/qK98Z47ptC-embed.png?newest=${Date.now()}`
          )
          .addFields(
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
            }
          )
          .setFooter(`Last Updated: ${updatedTime}`),
      ];

      pagination({
        embeds: embeds,
        author: message.author,
        channel: message.channel,
        time: 60000,
        button: [
          {
            name: "first",
            emoji: emoji.firstEmoji,
            style: "PRIMARY",
          },
          {
            name: "previous",
            emoji: emoji.leftEmoji,
            style: "PRIMARY",
          },
          {
            name: "next",
            emoji: emoji.rightEmoji,
            style: "PRIMARY",
          },
          {
            name: "last",
            emoji: emoji.lastEmoji,
            style: "PRIMARY",
          },
        ],
      });
    } else {
      try {
        message.channel.send("🔍 **Retrieving Data, I guess...**");

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

        const embeds = [
          new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`${country.country} - ${country.continent}`)
            .setURL(wikiImage)
            .setThumbnail(
              `https://www.countryflags.io/${
                require("../../assets/json/countries-abbreviation.json")[
                  country.country
                ]
              }/flat/64.png`
            )
            .addFields(
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
              }
            )
            .setFooter(`Last Updated: ${updatedTime}`),

          new Discord.MessageEmbed()
            .setColor("RANDOM")
            .setTitle(`${country.country} - ${country.continent}`)
            .setURL(wikiImage)
            .setThumbnail(
              `https://www.countryflags.io/${
                require("../../assets/json/countries-abbreviation.json")[
                  country.country
                ]
              }/flat/64.png`
            )
            .addFields(
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
              }
            )
            .setFooter(`Last Updated: ${updatedTime}`),
        ];

        pagination({
          embeds: embeds,
          author: message.author,
          channel: message.channel,
          time: 60000,
          button: [
            {
              name: "first",
              emoji: emoji.firstEmoji,
              style: "PRIMARY",
            },
            {
              name: "previous",
              emoji: emoji.leftEmoji,
              style: "PRIMARY",
            },
            {
              name: "next",
              emoji: emoji.rightEmoji,
              style: "PRIMARY",
            },
            {
              name: "last",
              emoji: emoji.lastEmoji,
              style: "PRIMARY",
            },
          ],
        });
      } catch (err) {
        const noResultsEmbed = new Discord.MessageEmbed()
          .setColor(red)
          .setDescription(
            emoji.denyEmoji +
              ` No fetched information for your specified country. It can be due to:
**+ The country does not exist.**
**+ It was typed incorrectly.**
**+ Or the country has no confirmed cases.**
`
          )
          .setFooter("bruh")
          .setTimestamp();
        return message.reply({ embeds: [noResultsEmbed] });
      }
    }
  },
};
