require('dotenv').config()

const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const { getSong } = require('genius-lyrics-api')

const { red, what, music } = require('../../colors.json')

module.exports = class LyricsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'lyrics',
            aliases: ['ly'],
            group: 'music',
            memberName: 'lyrics',
            description: 'Lyrics from a song given.',
            argsType: 'multiple',
            format: '<string>',
            examples: ['lyrics here comes the sun']
        })
    }

    async run(message, args) {
        const songInput = args.slice(0).join(' ')
        const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str)

        const options = {
            apiKey: process.env.GENIUS,
            title: songInput,
            artist: '',
            optimizeQuery: false
        }

        if (!songInput) {
            const noSearchEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> The name input is blank.")
                .setFooter("interesting")
                .setTimestamp()
            message.reply(noSearchEmbed)
            return
        }

        message.channel.send('Searching, I guess...')

        getSong(options)
            .then(song => {
                try { 
                const splitLyrics = Discord.splitMessage(trim(song.lyrics, 5700), {
                    maxLength: 1024,
                    char: "\n",
                    prepend: "",
                    append: ""
                })
                    const lyricsEmbed = new Discord.MessageEmbed()
                        .setColor(music)
                        .setFooter('Lyrics Provided by Genius')
                        .setTimestamp()
                        .addFields({
                            name: `Probable Results for: ${songInput}`,
                            value: `[Genius ID Match: ${song.id}](${song.url})`
                        })
                    splitLyrics.map(async (m) => {
                        lyricsEmbed.addFields({
                            name: '\u200b',
                            value: m
                        })
                    })
                    message.channel.send(lyricsEmbed)
                } catch (err) {
                    console.log(err)
                    const noResultsEmbed = new Discord.MessageEmbed()
                        .setColor(red)
                        .setDescription(`<:scrubred:797476323169533963> No results for: **${songInput}**.`)
                        .setFooter("it doesn't exist in Genius")
                        .setTimestamp()
                    message.reply(noResultsEmbed)
                    return
                }
            })


    }
}

// Old version using Some Random Api
// const title = args.slice(0).join(' ')
//         const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str)
        
//         if (!title) {
//             const noSearchEmbed = new Discord.MessageEmbed()
//                 .setColor(red)
//                 .setDescription("<:scrubred:797476323169533963> The name input is blank.")
//                 .setFooter("interesting")
//                 .setTimestamp()
//             message.reply(noSearchEmbed)
//             return
//         }

//         message.channel.send('Searching, I guess...')

//         fetch(utf8.encode(`https://some-random-api.ml/lyrics?title=${title}`))
//             .then(res => res.json())
//             .then(json => {
//                 const splitLyrics = Discord.splitMessage(trim(json.lyrics, 5750), {
//                     maxLength: 1024,
//                     char: "\n",
//                     prepend: "",
//                     append: ""
//                 })

//                 try {            
//                     const lyricsEmbed = new Discord.MessageEmbed()
//                         .setColor(music)
//                         .setDescription(`[${json.title}](${json.links.genius}) - **${json.author}**`)
//                         .setFooter('Lyrics Provided by genius.com')
//                         .setTimestamp()
//                     splitLyrics.map(async (m) => {
//                         lyricsEmbed.addFields({
//                             name: '\u200b',
//                             value: m
//                         })
//                     })
//                     message.channel.send(lyricsEmbed)
//                 } catch (err) {
//                     console.log(err)
//                     const noResultsEmbed = new Discord.MessageEmbed()
//                         .setColor(red)
//                         .setDescription(`<:scrubred:797476323169533963> No results for: **${title}**.`)
//                         .setFooter("it doesn't exist in Genius")
//                         .setTimestamp()
//                     message.reply(noResultsEmbed)
//                     return
//                 }
//             })
