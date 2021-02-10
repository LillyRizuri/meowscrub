const { MessageEmbed } = require('discord.js')
const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor } = require('../../colors.json')

const responses = [
    "<:scrubgreen:797476323316465676> It is certain.",
    "<:scrubgreen:797476323316465676> It is decidedly so.",
    "<:scrubgreen:797476323316465676> Without a doubt.",
    "<:scrubgreen:797476323316465676> Yes – definitely.",
    "<:scrubgreen:797476323316465676> You may rely on it.",
    "<:scrubgreen:797476323316465676> As I see it, yes.",
    "<:scrubgreen:797476323316465676> Most likely.",
    "<:scrubgreen:797476323316465676> Outlook good.",
    "<:scrubgreen:797476323316465676> Yes.",
    "<:scrubgreen:797476323316465676> Signs point to yes.",
    "<:scrubyellow:797816476912058388> Reply hazy, try again.",
    "<:scrubyellow:797816476912058388> Ask again later.",
    "<:scrubyellow:797816476912058388> Better not tell you now.",
    "<:scrubyellow:797816476912058388> Cannot predict now.",
    "<:scrubyellow:797816476912058388> Concentrate and ask again.",
    "<:scrubred:797476323169533963> Don’t count on it.",
    "<:scrubred:797476323169533963> My reply is no.",
    "<:scrubred:797476323169533963> My sources say no.",
    "<:scrubred:797476323169533963> Outlook not so good.",
    "<:scrubred:797476323169533963> Very doubtful.",
]

module.exports = class rpsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: '8ball',
            group: 'funs',
            memberName: '8ball',
            argsType: 'single',
            description: 'Ask the 8-ball.'
        })
    }

    run(message, args) {
        const question = args
        if (!question) {
            message.reply('specify your question.')
            return
        }

        const answer = responses[Math.floor(Math.random() * (responses.length))]
        const eightBallEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor('The Magic 8-Ball')
            .addField(`Your question: ${question}`, `Answer: ${answer}`)
            .setFooter('hope it helps')
            .setTimestamp()
        message.channel.send(eightBallEmbed)
    }
}