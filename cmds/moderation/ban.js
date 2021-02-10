const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what, embedcolor } = require('../../colors.json')

module.exports = class BanCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'moderation',
            memberName: 'ban',
            description: "Ban a member in the current guild. Yes.",
            argsType: 'multiple',
            format: '<@user> [reason]',
            examples: ['ban @frockles not complying to the rules'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true
        })
    }

    async run(message, args) {
        let target = message.mentions.users.first()
        let reason

        if (!target) {
            const noTargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Who do you want to ban? Get it right.")
                .setFooter("are you trying to be an immature kid")
                .setTimestamp()
            message.reply(noTargetEmbed)
            return
        }

        switch (target) {
            case message.author:
                const banningYourselfEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription("<:scrubred:797476323169533963> Banning yourself? Keep dreaming.")
                    .setFooter("heh.")
                    .setTimestamp()
                message.reply(banningYourselfEmbed)
                return
            case this.client.user:
                const banningItselfEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription("<:scrubred:797476323169533963> Banning myself? Why?")
                    .setFooter("what are you doing.")
                    .setTimestamp()
                message.reply(banningItselfEmbed)
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
        if (user.bannable) {
            const dmReasonEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setTitle(`You were banned in ${guild.name}.`)
                .addFields({
                    name: "Performed By",
                    value: `${message.author.tag} (${message.author.id})`
                }, {
                    name: 'Reason for Banning',
                    value: reason
                })
                .setFooter("Sorry. Can't help out.")
                .setTimestamp()
            try {
                await user.send(dmReasonEmbed)
            } catch (err) {
                message.channel.send("Can't send the reason to the offender. Maybe they have their DM disabled.")
            }
            user.ban({ days: 1, reason: `from ${message.author.tag}: ${reason}` })
            const banConfirmEmbed = new Discord.MessageEmbed()
                .setColor(green)
                .setDescription(`<:scrubgreen:797476323316465676> Successfully banned **${target.tag}**.`)
                .addFields({
                    name: "Performed By",
                    value: `${message.author.tag} (${message.author.id})`
                }, {
                    name: 'Reason for Banning',
                    value: reason
                })
                .setFooter("well this is e")
                .setTimestamp()
            message.channel.send(banConfirmEmbed)
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