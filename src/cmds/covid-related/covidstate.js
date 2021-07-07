const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const { PaginatedEmbed } = require("embed-paginator");
const covid = require("covidtracker");
const fetch = require("node-fetch");
const statesJson = require("../../assets/json/states.json");

const { red } = require("../../assets/json/colors.json");

module.exports = class CovidStates extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "cstate",
      aliases: ["covidstate"],
      group: "covid-related",
      memberName: "cstate",
      argsType: "single",
      description: "Display stats about COVID-19 in an US state.",
      format: "<state>",
      examples: ["cstate texas"],
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

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> Are you gonna type in a state's name or not?"
      );

    message.channel.send("Retrieving Informations, I guess...");

    const stateInput = args.toProperCase();

    try {
      const state = await covid.getState({ state: stateInput });
      const updatedTime = new Date(state.updated).toLocaleDateString(
        "en-US",
        dateTimeOptions
      );

      const wikiName = state.state;

      const WikiPage = await fetch(
        `https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_${wikiName
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

      let flagURL = "";
      for (let i = 0; i < statesJson.length; i++) {
        if (state.state == statesJson[i].state)
          flagURL = statesJson[i].state_flag_url;
      }

      const active = `${state.active.toLocaleString()} (${(
        (state.active / state.cases) *
        100
      ).toFixed(2)}%)`;

      const recovered = `${state.recovered.toLocaleString()} (${(
        (state.recovered / state.cases) *
        100
      ).toFixed(2)})%`;

      const deaths = `${state.deaths.toLocaleString()} (${(
        (state.deaths / state.cases) *
        100
      ).toFixed(2)}%)`;

      let lastUpdated = `Last Updated: ${updatedTime}`;
      if (imageLink) lastUpdated = `${lastUpdated}\n[Image](${imageLink})`;

      const definedStateEmbed = new PaginatedEmbed({
        colours: ["RANDOM"],
        descriptions: [lastUpdated],
        fields: [
          {
            name: "Cases",
            value: `
• All Cases: \`${state.cases.toLocaleString()}\`
• Active Cases: \`${active}\`   
            `,
            inline: true,
          },
          {
            name: "Recovered/Deaths/Tests",
            value: `
• Recovered: \`${recovered}\`
• Deaths: \`${deaths}\`
• Tests: \`${state.tests.toLocaleString()}\`            
            `,
            inline: true,
          },
          {
            name: "Today",
            value: `
• Today Cases: \`+ ${state.todayCases.toLocaleString()}\`
• Today Deaths: \`+ ${state.todayDeaths.toLocaleString()}\`
            `,
            inline: true,
          },
          {
            name: "Per One Million",
            value: `
• Cases Per Mil: \`${state.casesPerOneMillion.toLocaleString()}\`  
• Deaths Per Mil: \`${state.deathsPerOneMillion.toLocaleString()}\`
• Tests Per Mil: \`${state.testsPerOneMillion.toLocaleString()}\`
            `,
            inline: true,
          },
        ],
        duration: 60 * 1000,
        itemsPerPage: 2,
        paginationType: "field",
      })
        .setAuthor(state.state)
        .setThumbnail(flagURL);
      definedStateEmbed.send(message.channel);
    } catch (err) {
      const noResultsEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          `
<:scrubred:797476323169533963> No fetched information for your specified state. Either:
**+ The state does not exist.**
**+ It was typed incorrectly.**
`
        )
        .setFooter("brhmmmuh")
        .setTimestamp();
      message.reply(noResultsEmbed);
    }
  }
};
