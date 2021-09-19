const Discord = require("discord.js");
const { pagination } = require("reconlx");
const covid = require("covidtracker");
const fetch = require("node-fetch");
const statesJson = require("../../assets/json/states.json");

const emoji = require("../../assets/json/tick-emoji.json");
const { red } = require("../../assets/json/colors.json");

module.exports = {
  aliases: ["cstate", "covidstate"],
  memberName: "cstate",
  group: "covid",
  description: "Display stats about COVID-19 in a state in United States.",
  format: "<stateName>",
  examples: ["cstate texas"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
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

    if (!args)
      return message.reply(
        emoji.missingEmoji + " Are you gonna type in a state's name or not?"
      );

    message.channel.send("🔍 **Retrieving Data, I guess...**");

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
      ).toFixed(2)}%)`;

      const deaths = `${state.deaths.toLocaleString()} (${(
        (state.deaths / state.cases) *
        100
      ).toFixed(2)}%)`;

      const embeds = [
        new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(state.state)
          .setURL(imageLink)
          .setThumbnail(flagURL)
          .addFields(
            {
              name: "Cases",
              value:
`\`\`\`css
• All Cases:    ${state.cases.toLocaleString()}
• Active Cases: ${active}
\`\`\``,
            },
            {
              name: "Recovered/Deaths/Tests",
              value:
`\`\`\`css
• Recovered: ${recovered}
• Deaths:    ${deaths}
• Tests:     ${state.tests.toLocaleString()}
\`\`\``,
            }
          )
          .setFooter(`Last Updated: ${updatedTime}`),

        new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle(state.state)
          .setURL(imageLink)
          .setThumbnail(flagURL)
          .addFields(
            {
              name: "Today",
              value:
`\`\`\`css
• Today Cases:  + ${state.todayCases.toLocaleString()}
• Today Deaths: + ${state.todayDeaths.toLocaleString()}
\`\`\``,
            },
            {
              name: "Per One Million",
              value:
`\`\`\`css
• Cases Per Mil:  ${state.casesPerOneMillion.toLocaleString()}
• Deaths Per Mil: ${state.deathsPerOneMillion.toLocaleString()}
• Tests Per Mil:  ${state.testsPerOneMillion.toLocaleString()}
\`\`\``,
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
            ` No fetched information for your specified state. Either:
**+ The state does not exist.**
**+ It was typed incorrectly.**
`
        )
        .setFooter("brhmmmuh")
        .setTimestamp();
      message.reply({ embeds: [noResultsEmbed] });
    }
  },
};
