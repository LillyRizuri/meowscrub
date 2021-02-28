const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const fetch = require('node-fetch')

const { cat } = require('../../assets/json/colors.json')

module.exports = class CatFactsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'catfacts',
            group: 'funs',
            memberName: 'catfacts',
            description: 'Shows random facts about cat.'
        })
    }

    run(message) {
        try {
            fetch('https://some-random-api.ml/facts/cat')
            .then(res => res.json())
            .then(json => {
                const factsEmbed = new Discord.MessageEmbed()
                    .setColor(cat)
                    .setAuthor('Everyday Cat Facts')
                    .setDescription(`**${json.fact}**`)
                    .setFooter('cool stuff by Some Random Api')
                    .setTimestamp()
                message.channel.send(factsEmbed)
            })
        } catch (err) {
            message.reply("An error from the API side has occured. Please try again later.")
        }
    }
}