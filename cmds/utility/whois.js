const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const moment = require('moment')

const { red, embedcolor } = require('../../colors.json')

module.exports = class WhoIsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'whois',
            aliases: ['userinfo'],
            group: 'utility',
            memberName: 'whois',
            description: "Shows an user's information.",
            argsType: 'single',
            format: '[@user]',
            examples: ['whois @frockles'],
            guildOnly: true
        })
    }

    async run(message, args) {
        try {
            const { guild, channel } = message

            let user

            if (message.mentions.users.first()) {
                user = message.mentions.users.first()
            } else if (args[0]) {
                user = message.guild.members.cache.get(args).user
            } else {
                user = message.author
            }

            const member = guild.members.cache.get(user.id)

            let rolemap = member.roles.cache
                .sort((a, b) => b.position - a.position)
                .map(r => r)
                .join(', ')
            if (rolemap.length > 1000) rolemap = 'Too many roles to display.'
            if (!rolemap) rolemap = 'No roles.'

            const thenJoin = moment(member.joinedTimestamp)
            const timeJoin = thenJoin.from(moment())
            const joinedAt = thenJoin.format("MMM Do, YYYY")
            const joinedaAtHM = thenJoin.format("HH:MM")

            const thenRegister = moment(user.createdTimestamp)
            const timeRegister = thenRegister.from(moment())
            const RegisteredAt = thenRegister.format("MMM Do, YYYY")
            const RegisteredAtHM = thenRegister.format("HH:MM")

            const infoEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor(`Information for ${user.username}` , user.displayAvatarURL())
                .setThumbnail(user.displayAvatarURL())
                .setDescription(`[<@${user.id}>]`)
                .addFields({
                    name: 'Member Details',
                    value:
`
• Nickname: \`${member.nickname || 'None'}\`
• Roles [${member.roles.cache.size}]: ${rolemap}            
• Joined: \`${joinedAt} ${joinedaAtHM} (${timeJoin})\`      
                    `
                }, {
                    name: 'User Details',
                    value:
`
• ID: \`${user.id}\`
• Username: \`${user.tag}\`
• Created: \`${RegisteredAt} ${RegisteredAtHM} (${timeRegister})\`
• Is Bot: \`${(user.bot)}\`
`
                })
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
            channel.send(infoEmbed)
        } catch (err) {
            const notValidIDEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription('<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?')
                .setFooter('you fool')
                .setTimestamp()
            return message.reply(notValidIDEmbed)

        }
    }
}