const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what } = require('../../colors.json')

module.exports = class KickCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'moderation',
            memberName: 'kick',
            description: "Kick a member. It's that easy.",
            format: '<@user>',
            examples: ['kick @frockles'],
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            guildOnly: true
        })
    }

    run(message) {
        const target = message.mentions.users.first()
        if (!target) {
            const noTargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Who do you want to kick? Get it right.")
                .setFooter("bruh")
                .setTimestamp()
            message.reply(noTargetEmbed)
            return
        }

        if (target === message.author) {
            const kickingYourselfEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Kicking yourself? Try leaving the server.")
                .setFooter("that's technically kicking yourself")
                .setTimestamp()
            message.reply(kickingYourselfEmbed)
            return
        }

        const { guild } = message

        const member = guild.members.cache.get(target.id)
        if (member.kickable) {
            member.kick()
            const kickConfirmEmbed = new Discord.MessageEmbed()
                .setColor(green)
                .setDescription(`<:scrubgreen:797476323316465676> Successfully kicked <@${target.id}>.`)
                .setFooter("what now?")
                .setTimestamp()
            message.reply(kickConfirmEmbed)
        } else {
            const kickBruhEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> How in the world can I kick the user you specified?")
                .setFooter("ya bafoon")
                .setTimestamp()
            message.reply(kickBruhEmbed)
        }
    }

}