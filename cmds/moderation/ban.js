const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what } = require('../../colors.json')

module.exports = class BanCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'moderation',
            memberName: 'ban',
            description: "Ban a member. Yes.",
            format: '<@user>',
            examples: ['ban @frockles'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true
        })
    }

    run(message) {
        const target = message.mentions.users.first()
        if (!target) {
            const noTargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Who do you want to ban? Get it right.")
                .setFooter("are you trying to be an immature kid")
                .setTimestamp()
            message.reply(noTargetEmbed)
            return
        }

        if (target === message.author) {
            const banningYourselfEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Banning yourself? Keep dreaming.")
                .setFooter("heh.")
                .setTimestamp()
            message.reply(banningYourselfEmbed)
            return
        }

        const { guild } = message

        const member = guild.members.cache.get(target.id)
        if (member.bannable) {
            member.ban()
            const banConfirmEmbed = new Discord.MessageEmbed()
                .setColor(green)
                .setDescription(`<:scrubgreen:797476323316465676> Successfully banned <@${target.id}>.`)
                .setFooter("well this is e")
                .setTimestamp()
            message.reply(banConfirmEmbed)
        } else {
            const banBruhEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> How the heck can I ban the user you specified?")
                .setFooter("ya bafoon")
                .setTimestamp()
            message.reply(banBruhEmbed)
        }
    }

}