const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const ytdl = require('ytdl-core')
const ytSearch = require('yt-search')

const { red, green, what } = require('../../colors.json')

module.exports = class PlayMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            aliases: ['p'],
            group: 'music',
            memberName: 'play',
            argsType: 'single',
            description: 'Very simple music command with no bullshit whatsoever.',
            format: '<string>',
            examples: ['play very noise'],
            clientPermissions: ['CONNECT', 'SPEAK'],
            guildOnly: true
        })
    }

    async run(message, args) {
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notInVCEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Join an appropriate voice channel to provide you music.`)
                .setFooter("now.")
                .setTimestamp()
            message.reply(notInVCEmbed)
            return
        }

        const permissions = voiceChannel.permissionsFor(message.client.user)

        if (!permissions.has('CONNECT')) {
            const vcpermsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> I don't think I can connect to the VC that you are in.`)
                .setFooter("try joining somewhere appropriate for this")
                .setTimestamp()
            message.reply(vcpermsEmbed)
            return
        }

        if (!permissions.has('SPEAK')) {
            const cantSpeakEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> I don't think that I can transmit music into the VC...`)
                .setFooter("is this a problem?")
                .setTimestamp()
            message.reply(cantSpeakEmbed)
            return
        }

        if (!args) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> I didn't see you searching for a specific music.`)
                .setFooter("search something for me to play.")
                .setTimestamp()
            message.reply(noInputEmbed)
            return
        }

        let song = {}
        console.log(song)

        if (ytdl.validateURL(args[1])) {
            const songInfo = await ytdl.getInfo(args[1])
            song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url }
        } else {
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query)
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null
            }

            const video = await videoFinder(args)
            if (video) {
                song = { title: video.title, url: video.url }
            } else {
                const noResultEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription(`<:scrubred:797476323169533963> Even with my power, I can't search the music that you were looking for.`)
                    .setFooter("try something different.")
                    .setTimestamp()
                message.reply(noResultEmbed)
                return
            }
        }
        
        const connection = await voiceChannel.join()
        const stream = ytdl(song.url, { filter: 'audioonly' })
        connection.play(stream, { seek: 0, volume: 0.5 })
            .on('finish', () => {
                voiceChannel.leave()
                const playBackDoneEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription('<:scrubnull:797476323533783050> **Shutting Down...**')
                message.channel.send(playBackDoneEmbed)
            })
        const playingEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription(`
<:scrubgreen:797476323316465676> **Now Playing:**
[${song.title}](${song.url})`)
            .setTimestamp()
        await message.channel.send(playingEmbed)

    }
}
