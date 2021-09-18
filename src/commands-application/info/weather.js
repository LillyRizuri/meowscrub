const Discord = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const weather = require("weather-js");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Shows weather reports for a specific location.")
    .addStringOption((option) =>
      option
        .setName("search-string")
        .setDescription("The specified location")
        .setRequired(true)
    ),
  group: "info",
  examples: ["weather hanoi"],
  clientPermissions: ["EMBED_LINKS"],
  callback: async (client, interaction) => {
    const args = interaction.options.getString("search-string");
    console.log(args);
    weather.find({ search: args, degreeType: "C" }, async (error, result) => {
      if (typeof result === "undefined" || result.length === 0)
        return interaction.reply({
          content: emoji.denyEmoji + " That is NOT a location. What's that.",
          ephemeral: true,
        });

      const current = result[0].current;
      const location = result[0].location;
      const forecast = result[0].forecast[2];

      const tempF = Math.round(current.temperature * 1.8 + 32);
      const feelsLikeF = Math.round(current.feelslike * 1.8 + 32);

      const forecastLow = Math.round(forecast.low * 1.8 + 32);
      const forecastHigh = Math.round(forecast.high * 1.8 + 32);

      const windDisplaySplit = current.winddisplay.split("km/h");
      const windDisplayMph = `${Math.round(
        windDisplaySplit[0] * 0.62137119223733
      )} mph${windDisplaySplit[1]}`;

      const weatherInfoEmbed = new Discord.MessageEmbed()
        .setTitle(
          `Weather report for ${current.observationpoint} - UTC${location.timezone}`
        )
        .setColor("RANDOM")
        .addFields(
          {
            name: "Current Weather",
            value:
`\`\`\`
• Weather:     ${current.skytext}
• Temperature: ${current.temperature}°C (${tempF}°F)
• Feels Like:  ${current.feelslike}°C (${feelsLikeF}°F)         
• Wind:        ${current.winddisplay} (${windDisplayMph})
• Humidity:    ${current.humidity}%
\`\`\``,
          },
          {
            name: "Weather Forecast For Tomorrow",
            value:
`\`\`\`
• Weather:       ${forecast.skytextday}            
• Temperature:   ${forecast.low} - ${forecast.high}°C (${forecastLow} - ${forecastHigh}°F)          
• Precipitation: ${forecast.precip}%
\`\`\``,
          }
        )
        .setFooter("weather.service.msn.com")
        .setTimestamp();
      interaction.reply({ embeds: [weatherInfoEmbed] });
    });
  },
};
