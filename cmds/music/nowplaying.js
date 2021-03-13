const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { what, red, embedcolor } = require('../../assets/json/colors.json')

module.exports = class NowPlayingCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'nowplaying',
            aliases: ['np', 'songinfo'],
            group: 'music',
            memberName: 'nowplaying',
            description: 'Shows what music am I playing, and the current playhead location.',
            guildOnly: true
        })
    }

    async run(message) {
        let queue = await this.client.distube.getQueue(message)

        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notinvcEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to see what I am playing.`)
                .setFooter("this is e")
                .setTimestamp()
            message.reply(notinvcEmbed)
            return
        }

        const playing = this.client.distube.isPlaying(message)
        if (playing === false) {
            const noSongsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> There's nothing playing.`)
                .setFooter("reeeeee")
                .setTimestamp()
            message.reply(noSongsEmbed)
            return
        }

        const npEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor('Now Playing')
            .setTitle(queue.songs[0].name)
            .setURL(queue.songs[0].url)
            .setThumbnail(queue.songs[0].thumbnail)
            .setDescription(`
• **Requested by:** \`${queue.songs[0].user.tag}\`
• **Current Playhead:** \`${queue.formattedCurrentTime}/${queue.songs[0].formattedDuration}\`
            `)
        message.channel.send(npEmbed)
    }
}
