const Commando = require('discord.js-commando')
const Discord = require('discord.js')

module.exports = class PollCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'poll',
            aliases: ['vote'],
            group: 'utility',
            memberName: 'poll',
            description: "Create yourself reactions to set a poll.",
            examples: ['poll'],
            guildOnly: true
        })
    }

    async run(message) {

        const addReactions = (message) => {
            message.react('<:scrubgreenlarge:797816509967368213>')

            setTimeout(() => {
                message.react('<:scrubredlarge:797816510579998730>')
            }, 750)

            setTimeout(() => {
                message.react('<:scrubnulllarge:797816510298324992>')
            }, 750)
        }

        await message.delete()
        const fetched = await message.channel.messages.fetch({ limit: 1 })
        if (fetched && fetched.first()) {
            addReactions(fetched.first())
        }


    }
}
