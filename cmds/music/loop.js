const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what } = require('../../colors.json')

module.exports = class LoopMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'loop',
            aliases: ['repeat'],
            group: 'music',
            memberName: 'loop',
            argsType: 'single',
            description: 'Loop `1`: A song, `2`: Repeat all the queue; or `0`: Disable.',
            format: '<value>',
            examples: ['loop 1'],
            guildOnly: true
        })
    }

    async run(message, args) {
        let queue = await this.client.distube.getQueue(message)
        const loopValue = Number(args)
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notInVCEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Join an appropriate voice channel to loop the music.`)
                .setFooter("now.")
                .setTimestamp()
            message.reply(notInVCEmbed)
            return
        }

        if (!queue) {
            const noQueueEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Must confirm that there's a queue first.`)
                .setFooter("reeee")
                .setTimestamp()
            message.reply(noQueueEmbed)
            return
        }

        if (!loopValue) {
            const noValueEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> There's no value to set.`)
                .setFooter("0 = Disable | 1 = Loop a song | 3 = Loop the queue")
                .setTimestamp()
            message.reply(noValueEmbed)
            return
        }
        if (loopValue > 2 || loopValue < 0 || isNaN(loopValue) || !Number.isInteger(loopValue)) {
            const invalidValueEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> Your value isn't valid.`)
                .setFooter("0 = Disable | 1 = Loop a song | 3 = Loop the queue")
                .setTimestamp()
            message.reply(invalidValueEmbed)
            return
        }

        let mode = this.client.distube.setRepeatMode(message, parseInt(loopValue))
        mode = mode ? mode == 2 ? "Repeat Queue" : "Repeat Song" : "Off"
        const selLoopEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription(`<:scrubgreen:797476323316465676> Set repeat option to: **${mode}**`)
        message.channel.send(selLoopEmbed)

    }
}
