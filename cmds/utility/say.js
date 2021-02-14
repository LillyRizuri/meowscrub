const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, what } = require('../../colors.json')

module.exports = class SayCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'say',
            aliases: ['s'],
            group: 'utility',
            memberName: 'say',
            description: "Make me say something to a channel.",
            argsType: 'multiple',
            format: '<#channel> <content>',
            examples: ['say #test hello'],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true
        })
    }

    run(message, args) {
        const textChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0])
        const content = args.slice(1).join(' ')

        if (message.content.includes('@everyone') || message.content.includes('@here')) {
            const includesAtEvery1Embed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Really? Including @everyone/@here isn't cool.")
                .setFooter('what are you trying')
                .setTimestamp()
            message.reply(includesAtEvery1Embed)
            return
        }

        if (!args[0]) {
            const noChannelEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Provide a channel before advancing.")
                .setFooter('well')
                .setTimestamp()
            message.reply(noChannelEmbed)
            return
        }

        if (!args[1]) {
            const noContentEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Message content to send, where did it go?")
                .setFooter('bruh')
                .setTimestamp()
            message.reply(noContentEmbed)
            return
        }

        try {
            textChannel.send(`${content}\n\n- ${message.author.tag}`)
                .then(message.react('✅'))
        } catch (err) {
            const invalidChannelEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Is that an invalid channel ID? Because I couldn't find the channel that you were looking for.")
                .setFooter('reeeeeee')
                .setTimestamp()
            message.reply(invalidChannelEmbed)
            return
        }
    }
}