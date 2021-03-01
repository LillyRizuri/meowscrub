const Commando = require('discord.js-commando')
const fetch = require('node-fetch')

module.exports = class chatCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'chatbot',
            aliases: ['cb', 'c', 'chat'],
            group: 'funs',
            memberName: 'chatbot',
            argsType: 'single',
            description: "Chat with a dumb self.",
            format: '<input>',
            examples: ['chatbot How are you?'],
        })
    }

    async run(message, args) {
        let input = encodeURIComponent(args)
        if (!input) {
            message.channel.send("You ain't gonna reply to me?")
            return
        }

        message.channel.startTyping()
        const response = await fetch(`${process.env.BRAINSHOP}&uid=1&msg=${input}`)
        const json = await response.json()
        message.channel.send(json.cnt.toLowerCase())
        return message.channel.stopTyping(true)
    }
}