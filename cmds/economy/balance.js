const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const economy = require('../../economy')

module.exports = class BalCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'balance',
            aliases: ['bal'],
            group: 'economy',
            memberName: 'balance',
            description: "Check your/someone else's pocket.",
            format: '[@user]',
            examples: ['balance', 'balance @frockles'],
            guildOnly: true
        })
    }

    async run(message, args) {
        const target = message.mentions.users.first() || message.author
        const targetId = target.id

        const guildId = message.guild.id
        const userId = target.id

        const coins = await economy.getCoins(guildId, userId)

        const balEmbed = new Discord.MessageEmbed()
                .setColor('#fffffe')
                .setTitle("Some Rando's Balance")
                .setDescription(`Balance: **¢${coins}**`)
                .setFooter("what a scrub")
                .setTimestamp()
            message.reply(balEmbed)
    }
}
