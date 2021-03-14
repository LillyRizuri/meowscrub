const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what } = require('../../assets/json/colors.json')

module.exports = class AutoPlayMusicCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'autoplay',
            group: 'music',
            memberName: 'autoplay',
            argsType: 'single',
            description: 'Enable/Disable the autoplay function by running the command.',
            details: "It's identical to the YouTube's autoplay function.",
            guildOnly: true
        })
    }

    async run(message) {
        let mode = null
        let queue = await this.client.distube.getQueue(message)
        const voiceChannel = message.member.voice.channel

        if (!voiceChannel) {
            const notInVCEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Join an appropriate voice channel to commit the action.`)
                .setFooter("now.")
                .setTimestamp()
            message.reply(notInVCEmbed)
            return
        }

        if (!queue) {
            const noQueueEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription(`<:scrubnull:797476323533783050> Must confirm that there's a queue first.`)
                .setFooter("reeee")
                .setTimestamp()
            message.reply(noQueueEmbed)
            return
        }

        mode = this.client.distube.toggleAutoplay(message)
        mode = mode ? "On" : "Off"
        const toggleAutoplayEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription(`<:scrubgreen:797476323316465676> Set autoplay mode to **${mode}**.`)
        message.channel.send(toggleAutoplayEmbed)
    }
}
