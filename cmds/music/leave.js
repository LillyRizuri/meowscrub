const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { what, red } = require('../../colors.json')

module.exports = class StopMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            aliases: ['dis', 'disconnect', 'fuckoff', 'stop', 'stahp'],
            group: 'music',
            memberName: 'leave',
            description: 'Stop playing music for you.',
            guildOnly: true
        })
    }

    async run(message) {
        let queue = await this.client.distube.getQueue(message)

        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notinvcEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to stop me.`)
                .setFooter("this is e")
                .setTimestamp()
            message.reply(notinvcEmbed)
            return
        }

        if (queue) {
            this.client.distube.stop(message)
            const stoppedEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription('<:scrubnull:797476323533783050> **Stopped the track, and cleaned the queue.**')
            message.channel.send(stoppedEmbed)
        } else if (!queue) {
            const noMusicEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> There's no music to play.")
                .setFooter('lol')
                .setTimestamp()
            message.reply(noMusicEmbed)
            return
        }
    }
}