const Commmando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor } = require('../../assets/json/colors.json')

module.exports = class OnlineStatsCommand extends Commmando.Command {
    constructor(client) {
        super(client, {
            name: 'online',
            aliases: ['memberstat', 'serverstat', 'onlinestat', 'on'],
            group: 'utility',
            memberName: 'online',
            description: 'Shows a statistic of people who are online, offline, etc...',
            guildOnly: true
        })
    }

    run (message) {
        const memberStatEmbed = new Discord.MessageEmbed()
        .setColor(embedcolor)
        .setAuthor(`Member Statistics`, message.guild.iconURL())
        .setTitle(`• Total Member(s): ${message.guild.members.cache.size}`)
        .setThumbnail(message.guild.iconURL())
        .setDescription(`
• **Online:** ${message.guild.members.cache.filter(m => m.user.presence.status === 'online' && !m.user.bot).size}
• **Idle:** ${message.guild.members.cache.filter(m => m.user.presence.status === 'idle' && !m.user.bot).size}
• **DND:** ${message.guild.members.cache.filter(m => m.user.presence.status === 'dnd' && !m.user.bot).size}
• **Offline**: ${message.guild.members.cache.filter(m => m.user.presence.status === 'offline' && !m.user.bot).size}
• **Bots:** ${message.guild.members.cache.filter(m => m.user.bot).size}
        `)
        .setFooter(`in ${message.guild.name}`)
        .setTimestamp()
        message.channel.send(memberStatEmbed)
    }
}