const Commando = require('discord.js-commando')
const path = require('path')
const Discord = require('discord.js')

module.exports = class PlayAudioCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'rickroll',
            group: 'soundboard',
            memberName: 'rickroll',
            description: 'Never gonna give you up',
            guildOnly: true
        })
    }

    async run(message) {
        const { voice } = message.member
        const voiceChannel = message.member.voice.channel

        if (!voice.channelID) {
            message.reply("<:scrubred:797476323169533963> Join an appropriate voice channel for shizzles. Now.")
            return
        }

        voice.channel.join().then((connection) => {
            connection.play('./assets/ogg/rickroll.ogg')
                .on('finish', () => {
                    voiceChannel.leave()
                })
        })

        await message.react(`🔊`)
        const RickrolldEmbed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setAuthor("get rickroll'd ya dunce")
            .setImage('https://media.tenor.com/images/96abb4fe817afa8bb2d0ad9439b30f0b/tenor.gif')
            .setTimestamp()
        await message.channel.send(RickrolldEmbed)
    }
}