const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, what } = require('../../assets/json/colors.json')

module.exports = class SkipMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            group: 'music',
            memberName: 'skip',
            description: "Attempt to skip a song if there's more than 1 song in the queue.",
            clientPermissions: ['CONNECT', 'SPEAK'],
            guildOnly: true
        })
    }

    async run(message) {
        let queue = await this.client.distube.getQueue(message)

        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notinvcEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to do that action.`)
                .setFooter("this is e")
                .setTimestamp()
            message.reply(notinvcEmbed)
            return
        }

        if (queue) {
            this.client.distube.skip(message)
            message.channel.send('⏩ **Skipped!**')
        } else if (!queue) {
            const noMusicEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> There's no music to play next.")
                .setFooter('xd')
                .setTimestamp()
            message.reply(noMusicEmbed)
            return
        }

    }
}
