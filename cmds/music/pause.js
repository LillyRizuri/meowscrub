const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor, red, what, green } = require('../../colors.json')

module.exports = class StopTrackEmbed extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'pause',
            aliases: ['stop', 'stahp'],
            group: 'music',
            memberName: 'pause',
            description: "Pause the music playback.",
            guildOnly: true
        })
    }

    run(message) {
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notInVCEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Join an appropriate voice channel to do that action.`)
                .setFooter("now.")
                .setTimestamp()
            message.reply(notInVCEmbed)
            return
        }

        const paused = this.client.distube.isPaused(message)
        const playing = this.client.distube.isPlaying(message)

        if (paused === true) {
            const alreadyPausedEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> It's already paused. Jeez.`)
                .setFooter("what's even the point")
                .setTimestamp()
            message.reply(alreadyPausedEmbed)
            return
        }

        switch (playing) {
            case true:
                this.client.distube.pause(message)
                const stoppedEmbed = new Discord.MessageEmbed()
                    .setColor(green)
                    .setDescription('<:scrubgreen:797476323316465676> **Paused the track.**')
                message.channel.send(stoppedEmbed)
                break;
            case false:
                const isNotPlayingEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> There's nothing playing.`)
                .setFooter("huh.")
                .setTimestamp()
            message.reply(isNotPlayingEmbed)
                break;
        }
    }
}