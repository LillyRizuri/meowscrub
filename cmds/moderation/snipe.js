const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const snipe = require('../../snipe.json')

const { embedcolor, what } = require('../../assets/json/colors.json')

const noMsgEmbed = new Discord.MessageEmbed()
    .setColor(what)
    .setDescription("<:scrubnull:797476323533783050> There's no latest deleted message.")
    .setFooter('lol')
    .setTimestamp()

module.exports = class SnipeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'snipe',
            group: 'moderation',
            memberName: 'snipe',
            description: "Reveals the latest deleted message.",
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true
        })
    }

    run(message) {
        try {
            let msg = snipe[message.channel.id].msg
            let author = snipe[message.channel.id].user
            let tag = snipe[message.channel.id].tag
            let time = snipe[message.channel.id].time
            let icon = snipe[message.channel.id].icon

            if (!snipe[message.channel.id]) {
                return message.reply(noMsgEmbed)
            }

            const embed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor(`${tag}`, icon)
                .setDescription(msg)
                .setFooter(`ID: ${author}`)
                .setTimestamp(time)
            message.channel.send(embed)
        } catch (err) {
            return message.reply(noMsgEmbed)
        }
    }
}