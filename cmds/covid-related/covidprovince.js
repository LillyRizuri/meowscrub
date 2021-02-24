const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const covid = require('covidtracker')

const { what, red, embedcolor } = require('../../colors.json')

module.exports = class CovidProvinceCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'cprovince',
            aliases: ['covidprovince'],
            group: 'covid-related',
            memberName: 'cprovince',
            argsType: 'multiple',
            description: 'Display stats about COVID-19 in a specified province.',
            format: '<country> <province>',
            examples: ['cprovince canada ontario']
        })
    }

    async run(message, args) {
        const dateTimeOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' }

        if (!args[0] || !args[1]) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> You must provide a country and province name. In that order.")
                .setFooter("aeeeee")
                .setTimestamp()
            message.reply(noInputEmbed)
            return
        }

        message.channel.send('Retrieving Informations, I guess...')

        const country = args[0].toProperCase()
        const province = args.slice(1).join(' ').toProperCase()

        const prov = await covid.getJHU({ country, province })
        const obj = prov[0]
        const updatedTime = new Date(obj.updatedAt).toLocaleDateString('en-US', dateTimeOptions)

        if (!obj) {
            const noResultEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`
<:scrubred:797476323169533963> Couldn't find the province you provided. Either:
**+ The province does not exist.**
**+ It was typed incorrectly.**
`)
                .setFooter("check again.")
                .setTimestamp()
            message.reply(noResultEmbed)
            return
        }

        const embed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(`${obj.province}, ${obj.country}`)
            .addFields({
                name: 'Confirmed Cases',
                value: `**${obj.stats.confirmed.toLocaleString()}**`,
                inline: true
            }, {
                name: 'Deaths',
                value: `${obj.stats.deaths.toLocaleString()} (${((obj.stats.deaths / obj.stats.confirmed) * 100).toFixed(2)}%)`,
                inline: true
            }, {
                name: 'Recovered',
                value: `${obj.stats.recovered.toLocaleString()} (${((obj.stats.recovered / obj.stats.confirmed) * 100).toFixed(2)}%)`,
                inline: true
            })
            .setFooter(`Last Updated: ${updatedTime}`)
        message.channel.send(embed)
    }
}