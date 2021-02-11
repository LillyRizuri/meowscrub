const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor, red } = require('../../colors.json')

module.exports = class AvatarCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['av', 'pfp', 'icon'],
            group: 'utility',
            memberName: 'avatar',
            description: "Return your/someone else's avatar.",
            argsType: 'multiple',
            format: '[@user]',
            examples: ['avatar', 'avatar @frockles'],
            guildOnly: true
        })
    }

    run(message, args) {
        let user

        try {
            if (message.mentions.users.first()) {
                user = message.mentions.users.first()
            } else if (args[0]) {
                user = message.guild.members.cache.get(args[0]).user
            } else {
                user = message.author
            }

            const avatar = user.displayAvatarURL({ format: 'png', size: 4096, dynamic: true })

            const avatarEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor(`${user.tag}'s Profile Picture`)
                .setImage(avatar)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
            message.channel.send(avatarEmbed)
        } catch (err) {
            console.log(err)
            const notValidIDEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription('<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?')
                .setFooter('you fool')
                .setTimestamp()
            message.reply(notValidIDEmbed)
            return
        }
    }
}