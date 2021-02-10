const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red } = require('../../colors.json')

module.exports = class StopMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            aliases: ['dis', 'disconnect', 'stop', 'fuckoff'],
            group: 'music',
            memberName: 'leave',
            description: 'Stop playing music for you.',
            guildOnly: true
        })
    }

    async run(message) {
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notinvcEmbed = new Discord.MessageEmbed()
                .setColor(null)
                .setDescription(`<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to stop me.`)
                .setFooter("this is e")
                .setTimestamp()
            message.reply(notinvcEmbed)
            return
        }
        await voiceChannel.leave()
        await message.react('⏹️')
    }
}