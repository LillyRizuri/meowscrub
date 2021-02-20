const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, green, what } = require('../../colors.json')

module.exports = class HackBanCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'hackban',
            group: 'moderation',
            memberName: 'hackban',
            description: "Ban a member outside a guild. That's even better.",
            argsType: 'multiple',
            format: '<userID> [reason]',
            examples: ['hackban @frockles illegal stuff spotted'],
            clientPermissions: ['BAN_MEMBERS', 'ADMINISTRATOR'],
            userPermissions: ['BAN_MEMBERS', 'ADMINISTRATOR'],
            guildOnly: true
        })
    }

    async run(message, args) {
        let userId = args[0]
        let reason

        if (!userId || isNaN(userId)) {
            const noTargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Who do you want to ban outside the server? Get it right.")
                .setFooter("hackbanning for good reason?")
                .setTimestamp()
            message.reply(noTargetEmbed)
            return
        }

        if (message.mentions.users.first()) {
            const noMentionsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> Use \`${message.guild.commandPrefix}ban\` or something if you want to ban using mentions.`)
                .setFooter("huh.")
                .setTimestamp()
            message.reply(noMentionsEmbed)
            return
        }

        switch (userId) {
            case message.author.setDescription:
                const banningYourselfEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription("<:scrubred:797476323169533963> Banning yourself with your ID? Keep dreaming.")
                    .setFooter("heh.")
                    .setTimestamp()
                message.reply(banningYourselfEmbed)
                return
            case this.client.user.id:
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

        this.client.users.fetch(userId)
            .then(async user => {
                await message.guild.members.ban(user.id, { days: 1, reason: `from ${message.author.tag}: ${reason}` })
                const banConfirmEmbed = new Discord.MessageEmbed()
                    .setColor(green)
                    .setDescription(`<:scrubgreen:797476323316465676> Successfully banned **${user.tag}**.`)
                    .addFields({
                        name: "Performed By",
                        value: `${message.author.tag} (${message.author.id})`
                    }, {
                        name: 'Reason for Banning',
                        value: reason
                    })
                    .setFooter("well this is too e")
                    .setTimestamp()
                message.channel.send(banConfirmEmbed)
            }).catch(err => {
                const banBruhEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription("<:scrubred:797476323169533963> What is that user? God.")
                    .setFooter("heckaroo")
                    .setTimestamp()
                message.reply(banBruhEmbed)
            })
    }
}