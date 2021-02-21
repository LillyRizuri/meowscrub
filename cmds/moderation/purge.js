const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what } = require('../../colors.json')

module.exports = class BanCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'purge',
            group: 'moderation',
            aliases: ['clean'],
            memberName: 'purge',
            description: "Purge messages in an easy way.",
            format: '<number>',
            examples: ['purge 25'],
            argsType: 'single',
            clientPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
            userPermissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'],
            guildOnly: true
        })
    }

    async run(message, args) {
        if (!args) {
            const noValueEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> No valid numbers of messages that you want to clean...")
                .setFooter("what the")
                .setTimestamp()
            message.reply(noValueEmbed)
            return
        }

        const amountToDelete = Number(args, 10)

        if (isNaN(amountToDelete)) {
            const purgeNanEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Are you trying to break me using things like that?")
                .setFooter("it's no use making me dead")
                .setTimestamp()
            message.reply(purgeNanEmbed)
            return
        }

        if (!Number.isInteger(amountToDelete)) {
            const purgeNotIntegerEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> How am I supposed to purge if the value isn't an integer?")
                .setFooter("ya bafoon")
                .setTimestamp()
            message.reply(purgeNotIntegerEmbed)
            return
        }

        if (!amountToDelete || amountToDelete < 2 || amountToDelete > 100) {
            const notValidValueEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> The value must be somewhere in-between 2 and 100.")
                .setFooter("for legal reasons")
                .setTimestamp()
            message.reply(notValidValueEmbed)
            return
        }

        const fetched = await message.channel.messages.fetch({
            limit: amountToDelete
        })

        try {
            message.delete()
            await message.channel.bulkDelete(fetched)
                .then(messages => {
                    const purgeOKEmbed = new Discord.MessageEmbed()
                        .setColor(green)
                        .setDescription(`<:scrubgreen:797476323316465676> Successfully purged off **${messages.size}** messages.`)
                        .setFooter("hmmmmmmm")
                        .setTimestamp()
                    message.reply(purgeOKEmbed)
                    .then(msg => {
                        msg.delete({ timeout: 5000 })
                    })
                })
        } catch (err) {
            const daysLimitEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Message older than 14 days can't be cleaned off due to how Discord API works.")
                .setFooter("not a trap i swear")
                .setTimestamp()
            message.reply(daysLimitEmbed)
        }
    }
}