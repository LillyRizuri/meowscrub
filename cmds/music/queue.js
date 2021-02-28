const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, what, embedcolor } = require('../../assets/json/colors.json')

module.exports = class ListQueueCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            group: 'music',
            memberName: 'queue',
            description: "Display the guild's music queue.",
            guildOnly: true
        })
    }

    async run(message) {
        let queue = await this.client.distube.getQueue(message)

        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notinvcEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to list the queue.`)
                .setFooter("this is e")
                .setTimestamp()
            message.reply(notinvcEmbed)
            return
        }

        if (queue) {
            const currentQueueEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor('Current queue for this Guild')
                .setDescription(queue.songs.map((song, id) =>
                    `**${id + 1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
                ).join("\n"))
            message.channel.send(currentQueueEmbed)
        } else if (!queue) {
            const noMusicEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> There's no queue.")
                .setFooter('xd')
                .setTimestamp()
            message.reply(noMusicEmbed)
            return
        }

    }
}
