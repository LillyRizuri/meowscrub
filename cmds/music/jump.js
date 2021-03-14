const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, what } = require('../../assets/json/colors.json')

module.exports = class JumpMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'jump',
            group: 'music',
            memberName: 'jump',
            description: "Jump from one music to another. List the queue to know which one to jump first.",
            argsType: 'single',
            format: '<musicNo>',
            examples: ['jump 3'],
            guildOnly: true
        })
    }

    async run(message, args) {
        let queue = await this.client.distube.getQueue(message)
        const musicNumber = Number(args)
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notinvcEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to jump through.`)
                .setFooter("this is e")
                .setTimestamp()
            message.reply(notinvcEmbed)
            return
        }

        if (!queue) {
            const noQueueEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> There's no queue to jump.`)
                .setFooter("reeee")
                .setTimestamp()
            message.reply(noQueueEmbed)
            return
        }

        if (!args) {
            const noValueEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Music number in the queue has to be found.`)
                .setFooter("use the queue command")
                .setTimestamp()
            message.reply(noValueEmbed)
            return
        }

        if (musicNumber <= 0 || isNaN(musicNumber) || !Number.isInteger(musicNumber)) {
            const invalidEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> Right off the bat, I can see that the value isn't valid.`)
                .setFooter("jeebus")
                .setTimestamp()
            message.reply(invalidEmbed)
            return
        }

        try {
            this.client.distube.jump(message, parseInt(musicNumber))
            message.channel.send(`⏩ Jumped to a music with the song number: **${musicNumber}**.`)
        } catch (err) {
            const incorrectValueEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> Completely invalid song number.`)
                .setFooter("sike?")
                .setTimestamp()
            message.reply(incorrectValueEmbed)
        }
    }
}
