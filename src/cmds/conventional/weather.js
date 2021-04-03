const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const weather = require("weather-js");

const { red, what, embedcolor } = require("../../assets/json/colors.json");

module.exports = class WeatherCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "weather",
      aliases: ["w"],
      group: "conventional",
      memberName: "weather",
      argsType: "single",
      description: "Shows weather report for a specific location.",
      format: "<location>",
      examples: ["weather hanoi"],
    });
  }

  run(message, args) {
    weather.find({ search: args, degreeType: "C" }, function (error, result) {
      // 'C' can be changed to 'F' for farneheit results
      if (!args)
        return message.reply(
          "<:scrubnull:797476323533783050> Specify a location in order to continue."
        );

      if (result === undefined || result.length === 0)
        return message.reply(
          "<:scrubred:797476323169533963> THIS is not a location. What's that."
        );

      var current = result[0].current;
      var location = result[0].location;

      const tempF = Math.round(result[0].current.temperature * 1.8 + 32);
      const feelsLikeF = Math.round(result[0].current.feelslike * 1.8 + 32);
      const windDisplaySplit = result[0].current.winddisplay.split("km/h");
      const windDisplayMph =
        Math.round(windDisplaySplit[0] * 0.62137119223733) +
        " mph" +
        windDisplaySplit[1];

      const weatherinfo = new Discord.MessageEmbed()
        .setTitle(`**UTC${location.timezone} | ${current.skytext}**`)
        .setAuthor(`Weather report for ${current.observationpoint}`)
        .setThumbnail(current.imageUrl)
        .setColor(embedcolor)
        .setDescription(
          `
• **Temperature:** ${current.temperature}°C (${tempF}°F)               
• **Feels Like:** ${current.feelslike}°C (${feelsLikeF}°F)         
• **Wind:** ${current.winddisplay} (${windDisplayMph})
• **Humidity:** ${current.humidity}%
`
        )
        .setFooter("weather.service.msn.com")
        .setTimestamp();
      message.channel.send(weatherinfo);
    });
  }
};
