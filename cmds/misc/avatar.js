const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor, red } = require('../../assets/json/colors.json')

module.exports = class AvatarCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'avatar',
            aliases: ['av', 'pfp', 'icon'],
            group: 'misc',
            memberName: 'avatar',
            description: "Return your/someone else's avatar.",
            argsType: 'single',
            format: '[@user/userID]',
            examples: ['avatar', 'avatar @frockles', 'avatar 693832549943869493'],
            guildOnly: true
        })
    }

    run(message, args) {
        let user
        let avatar

        if (message.mentions.users.first()) {
            user = message.mentions.users.first()
            avatar = user.displayAvatarURL({ format: 'png', size: 4096, dynamic: true })
            const avatarEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor(`${user.tag}'s Profile Picture`)
                .setImage(avatar)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
            message.channel.send(avatarEmbed)
            return
        } else if (args) {
            this.client.users.fetch(args)
                .then(async user => {
                    avatar = user.displayAvatarURL({ format: 'png', size: 4096, dynamic: true })
                    const avatarEmbed = new Discord.MessageEmbed()
                        .setColor(embedcolor)
                        .setAuthor(`${user.tag}'s Profile Picture`)
                        .setImage(avatar)
                        .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
                    message.channel.send(avatarEmbed)
                    return
                }).catch(err => {
                    const notValidIDEmbed = new Discord.MessageEmbed()
                        .setColor(red)
                        .setDescription('<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?')
                        .setFooter('you fool')
                        .setTimestamp()
                    message.reply(notValidIDEmbed)
                    return
                })
        } else {
            user = message.author
            avatar = user.displayAvatarURL({ format: 'png', size: 4096, dynamic: true })
            const avatarEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor(`${user.tag}'s Profile Picture`)
                .setImage(avatar)
                .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }))
            message.channel.send(avatarEmbed)
        }
    }
}