const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const weather = require("weather-js");

module.exports = class WeatherCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "weather",
      aliases: ["wt"],
      group: "conventional",
      memberName: "weather",
      argsType: "single",
      description: "Shows weather report for a specific location.",
      format: "<location>",
      examples: ["weather hanoi"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message, args) {
    weather.find({ search: args, degreeType: "C" }, function (error, result) {
      if (!args)
        return message.reply(
          "<:scrubnull:797476323533783050> Specify a location in order to continue."
        );

      message.channel.send("Attempting to retrieve weather data...");

      if (typeof result === "undefined" || result.length === 0)
        return message.reply(
          "<:scrubred:797476323169533963> THIS is not a location. What's that."
        );

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

      const weatherinfo = new Discord.MessageEmbed()
        .setTitle(
          `Weather report for ${current.observationpoint} - UTC${location.timezone}`
        )
        .setColor("RANDOM")
        .addFields(
          {
            name: "Current Weather",
            value: `
• **Weather:** \`${current.skytext}\`
• **Temperature:** \`${current.temperature}°C (${tempF}°F)\`
• **Feels Like:** \`${current.feelslike}°C (${feelsLikeF}°F)\`         
• **Wind:** \`${current.winddisplay} (${windDisplayMph})\`
• **Humidity:** \`${current.humidity}%\`
            `,
            inline: true,
          },
          {
            name: "Weather Forecast For Tomorrow",
            value: `
• **Weather:** \`${forecast.skytextday}\`            
• **Temperature:** \`${forecast.low} - ${forecast.high}°C (${forecastLow} - ${forecastHigh}°F)\`          
• **Precipitation:** \`${forecast.precip}%\`
          `,
            inline: true,
          }
        )
        .setFooter("weather.service.msn.com")
        .setTimestamp();
      message.channel.send(weatherinfo);
    });
  }
};
