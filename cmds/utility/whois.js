const Commando = require('discord.js-commando')
const Discord = require('discord.js')

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

            const infoEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor(`Information for ${user.username}`, user.displayAvatarURL())
                .setThumbnail(user.displayAvatarURL())
                .addFields({
                    name: 'Username & Tag',
                    value: user.tag,
                    inline: true
                }, {
                    name: 'NIckname',
                    value: member.nickname || 'None',
                    inline: true
                }, {
                    name: 'Bot Status',
                    value: user.bot,
                    inline: true
                }, {
                    name: 'Joined Since',
                    value: new Date(member.joinedTimestamp).toLocaleDateString(),
                    inline: true
                }, {
                    name: 'Registered Since',
                    value: new Date(user.createdTimestamp).toLocaleDateString(),
                    inline: true
                }, {
                    name: 'Role Count',
                    value: member.roles.cache.size - 1,
                    inline: true
                })
                .setFooter(`User ID: ${user.id}`)
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