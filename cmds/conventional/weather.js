const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const weather = require('weather-js')

const { red, what, embedcolor } = require('../../colors.json')

module.exports = class WeatherCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'weather',
            aliases: ['w'],
            group: 'conventional',
            memberName: 'weather',
            argsType: 'multiple',
            description: 'Shows weather report for a specific location.',
            format: '<location>',
            examples: ['weather hanoi']
        })
    }

    run(message, args) {
        weather.find({ search: args.join(" "), degreeType: 'C' }, function (error, result) {
            // 'C' can be changed to 'F' for farneheit results
            if (!args[0]) {
                const noLocationEmbed = new Discord.MessageEmbed()
                    .setColor(what)
                    .setDescription('<:scrubnull:797476323533783050> Specify a location in order to continue.')
                    .setFooter('normie')
                    .setTimestamp()
                message.reply(noLocationEmbed)
                return
            }

            if (result === undefined || result.length === 0) {
                const noLocationEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription('<:scrubred:797476323169533963> THIS is not a location.')
                    .setFooter('what the hell are you searching')
                    .setTimestamp()
                message.reply(noLocationEmbed)
                return
            }

            var current = result[0].current
            var location = result[0].location

            const tempF = Math.round((result[0].current.temperature * 1.8) + 32)
            const feelsLikeF = Math.round((result[0].current.feelslike * 1.8) + 32)


            const weatherinfo = new Discord.MessageEmbed()
                .setTitle(`**${current.skytext}**`)
                .setAuthor(`Weather report for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(embedcolor)
                .addFields({
                    name: 'Timezone',
                    value: `UTC${location.timezone}`,
                    inline: true
                }, {
                    name: 'Degree Type',
                    value: 'Celsius\nFahrenheit',
                    inline: true
                }, {
                    name: 'Temperature',
                    value: `${current.temperature}°C\n${tempF}°F`,
                    inline: true
                }, {
                    name: 'Wind',
                    value: `${current.winddisplay}`,
                    inline: true
                }, {
                    name: 'Feels like',
                    value: `${current.feelslike}°C\n${feelsLikeF}°F`,
                    inline: true
                }, {
                    name: 'Humidity',
                    value: `${current.humidity}%`,
                    inline: true
                })
                .setFooter('Weather Data from MSN')
                .setTimestamp()
            message.channel.send(weatherinfo)
        })
    }
}