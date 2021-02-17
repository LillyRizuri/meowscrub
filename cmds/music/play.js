const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, what } = require('../../colors.json')

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
        const music = args
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

        if (!music) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> I didn't see you searching for a specific music.`)
                .setFooter("search something for me to play.")
                .setTimestamp()
            message.reply(noInputEmbed)
            return
        }

        this.client.distube.play(message, music)
    }
}
