const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, what, green } = require('../../colors.json')

module.exports = class SeekMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'seek',
            aliases: ['playhead'],
            group: 'music',
            memberName: 'seek',
            argsType: 'single',
            description: 'Seek the playhead by providing the timestamp. (in milliseconds)',
            format: '<string>',
            examples: ['seek 5200'],
            guildOnly: true
        })
    }

    run(message, args) {
        const seekValue = Number(args)
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notInVCEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Join an appropriate voice channel to seek.`)
                .setFooter("now.")
                .setTimestamp()
            message.reply(notInVCEmbed)
            return
        }

        if (!seekValue) {
            const noValueEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> There's no value provided to seek.")
                .setFooter("what are you going to do")
                .setTimestamp()
            message.reply(noValueEmbed)
            return
        }

        if (isNaN(seekValue) || !Number.isInteger(seekValue) || seekValue < 0) {
            const noValueEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> THAT is not a valid number")
                .setFooter("bruh what")
                .setTimestamp()
            message.reply(noValueEmbed)
            return
        }

        this.client.distube.seek(message, Number(seekValue))
        const seekEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription(`<:scrubgreen:797476323316465676> Moved the playhead to **${seekValue}** milliseconds.`)
        message.channel.send(seekEmbed)
    }
}
