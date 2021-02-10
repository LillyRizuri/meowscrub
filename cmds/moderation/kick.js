const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what, embedcolor } = require('../../colors.json')

module.exports = class KickCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'moderation',
            memberName: 'kick',
            description: "Kick a member. It's that easy.",
            argsType: 'multiple',
            format: '<@user> [reason]',
            examples: ['kick @frockles get out pls'],
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            guildOnly: true
        })
    }

    async run(message, args) {
        const target = message.mentions.users.first()
        let reason

        if (!target) {
            const noTargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Who do you want to kick? Get it right.")
                .setFooter("bruh")
                .setTimestamp()
            message.reply(noTargetEmbed)
            return
        }

        switch (target) {
            case message.author:
                const kickingYourselfEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription("<:scrubred:797476323169533963> Kicking yourself? Try leaving the server.")
                    .setFooter("that's technically kicking yourself")
                    .setTimestamp()
                message.reply(kickingYourselfEmbed)
                return
            case this.client.user:
                const kickingItselfEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription("<:scrubred:797476323169533963> Kicking myself? Do I need to leave by myself?")
                    .setFooter("wot.")
                    .setTimestamp()
                message.reply(kickingItselfEmbed)
                return
        }

        if (args.slice(1).join(' ').length > 1000) {
            const tooMuchReason = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Consider lowering your reason's length to be just under 1000 characters.")
                .setFooter("for legal reason, it's not a joke")
                .setTimestamp()
            message.reply(tooMuchReason)
            return
        }

        if (args[1]) {
            reason = args.slice(1).join(' ')
        } else {
            reason = 'No reason provided.'
        }

        const { guild } = message

        const user = guild.members.cache.get(target.id)
        if (user.kickable) {
            const dmReasonEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setTitle(`You were kicked in ${guild.name}.`)
                .addFields({
                    name: "Performed By",
                    value: `${message.author.tag} (${message.author.id})`
                }, {
                    name: 'Reason for Kicking',
                    value: reason
                })
                .setFooter("Well.")
                .setTimestamp()
            try {
                await user.send(dmReasonEmbed)
            } catch (err) {
                message.channel.send("Can't send the reason to the offender. Maybe they have their DM disabled.")
            }
            user.kick()
            const kickConfirmEmbed = new Discord.MessageEmbed()
                .setColor(green)
                .setDescription(`<:scrubgreen:797476323316465676> Successfully kicked <@${target.id}>.`)
                .addFields({
                    name: "Performed By",
                    value: `${message.author.tag} (${message.author.id})`
                }, {
                    name: 'Reason for Kicking',
                    value: reason
                })
                .setFooter("what now?")
                .setTimestamp()
            message.channel.send(kickConfirmEmbed)
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