const Commando = require('discord.js-commando')
const path = require('path')

module.exports = class PlayAudioCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'soi',
            group: 'soundboard',
            memberName: 'soi',
            description: 'soi soi soi soi soi',
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
            connection.play(path.join(__dirname, 'soi.ogg'))
            .on('finish', () => {
                voiceChannel.leave();
            })
        })

        await message.react(`🔊`)
    }
}