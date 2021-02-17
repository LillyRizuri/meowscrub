const Commando = require('discord.js-commando')
const alexa = require('alexa-bot-api')
const ai = new alexa()
// const { chatBot } = require('reconlx')

module.exports = class chatCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'chatbot',
            aliases: ['cb', 'c'],
            group: 'funs',
            memberName: 'chatbot',
            argsType: 'single',
            description: "Chat with a dumb self.",
            format: '<input>',
            examples: ['chatbot How are you?'],
        })
    }

    run(message, args) {
        const input = args
        if (!input) return message.reply("You ain't gonna reply to me?")
        
        ai.getReply(input).then(reply => {
            message.channel.send((reply).toLowerCase())
        })

        // chatBot(message, input)
    }
}