const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const covid = require('covidtracker')
const fetch = require('node-fetch')
const statesJson = require('../../assets/json/states.json')

const { what, red, embedcolor } = require('../../colors.json')

module.exports = class CovidStates extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'covidstate',
            group: 'covid-related',
            memberName: 'covidstate',
            argsType: 'multiple',
            description: 'Display stats about COVID-19 in an US state.',
            format: '<state>',
            examples: ['state texas']
        })
    }

    async run(message, args) {
        if (!args[0]) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Are you gonna type in a state's name or not?")
                .setFooter('h')
                .setTimestamp()
            message.reply(noInputEmbed)
            return
        }
        
        message.channel.send('Retrieving Informations, I guess...')

        const stateInput = args.join(' ').toProperCase()

        const state = await covid.getState({ state: stateInput })
        if (!state) {
            const noResultsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`
<:scrubred:797476323169533963> No fetched information for your specified state. Either:
**+ The state does not exist.**
**+ It was typed incorrectly.**
`)
                .setFooter("brhmmmuh")
                .setTimestamp()
            message.reply(noResultsEmbed)
            return
        }

        const wikiName = state.state

        const WikiPage = await fetch(`https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_${wikiName.replace(' ', '_').replace(' ', '_').replace(' ', '_').replace(' ', '_').replace(' ', '_').replace(' ', '_').replace(' ', '_').replace(' ', '_')}`).then(res => res.text())
        const ImageRegex = /<meta property="og:image" content="([^<]*)"\/>/
        const ImageLink = ImageRegex.exec(WikiPage)
        let imageLink
        if (ImageLink) imageLink = ImageLink[1]

        let flagURL = ''
        for (let i = 0; i < statesJson.length; i++) {
            if (state.state == statesJson[i].state) flagURL = statesJson[i].state_flag_url
        }

        const covidStatesEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(state.state)
            .setThumbnail(flagURL)
            .addFields({
                name: 'Confirmed Cases',
                value: `**${state.cases.toLocaleString()}**`,
                inline: true
            }, {
                name: 'Today Cases',
                value: `+${state.todayCases.toLocaleString()}`,
                inline: true
            }, {
                name: 'Today Deaths',
                value: `+${state.todayDeaths.toLocaleString()}`,
                inline: true
            }, {
                name: 'Active',
                value: `${state.active.toLocaleString()} (${((state.active / state.cases) * 100).toFixed(2)}%)`,
                inline: true
            }, {
                name: 'Deaths',
                value: `${state.deaths.toLocaleString()} (${((state.deaths / state.cases) * 100).toFixed(2)}%)`,
                inline: true
            }, {
                name: 'Tests',
                value: state.tests.toLocaleString(),
                inline: true
            })
        if (imageLink) covidStatesEmbed.setImage(imageLink)
        message.channel.send(covidStatesEmbed)
    }
}