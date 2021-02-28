const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const fetch = require('node-fetch')

const { red, what, embedcolor } = require('../../assets/json/colors.json')

module.exports = class WikipediaCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'wikipedia',
            aliases: ['wiki', 'wikia', 'wikip'],
            group: 'conventional',
            memberName: 'wikipedia',
            argsType: 'single',
            description: 'Search for a Wikipedia entry.',
            format: '<query>',
            examples: ['wikipedia vietnam']
        })
    }

    async run(message, args) {
        const wiki = args
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki)}`
        if (!wiki) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Search something for me to find the entry.")
                .setFooter('i am not a toy')
                .setTimestamp()
            return message.reply(noInputEmbed)
        }

        let response
        try {
            response = await fetch(url)
                .then(res => res.json())
        } catch (err) {
            message.reply("An error from the other side has occured. Please try again later.")
        }

        try {
            if (response.type === 'disambiguation') {
                const tooManyResultsEmbed = new Discord.MessageEmbed()
                    .setColor(embedcolor)
                    .setTitle(response.title) // Title Of Topic
                    .setURL(response.content_urls.desktop.page) // URL Of Searched Topic
                    .setDescription([`
${response.extract}
[Check this link to see what can ${response.title} also refers to](${response.content_urls.desktop.page}).`])
                message.channel.send(tooManyResultsEmbed)
            } else {
                const definedEmbed = new Discord.MessageEmbed()
                    .setColor(embedcolor)
                    .setTitle(response.title) // Title Of Topic
                    .setURL(response.content_urls.desktop.page) // URL Of Searched Topic
                    .setThumbnail(response.thumbnail.source)
                    .setDescription(response.extract)
                message.channel.send(definedEmbed)
            }
        } catch (err) {
            const noResultsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> That search query is trash.")
                .setFooter('what are you even searching for')
                .setTimestamp()
            return message.reply(noResultsEmbed)
        }
    }
}