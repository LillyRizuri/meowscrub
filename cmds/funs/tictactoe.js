const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const { tictactoe } = require('reconlx')

const { what, red } = require('../../colors.json')

module.exports = class TicTacToeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'tictactoe',
            aliases: ['ttt'],
            group: 'funs',
            memberName: 'tictactoe',
            description: 'Play some really simple tic-tac-toe.',
            format: '<@user>',
            examples: ['tictactoe @frockles'],
            guildOnly: true
        })
    }

    run(message) {
        const member = message.mentions.users.first()

        if (!member) {
            const zeroTargethEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription('<:scrubnull:797476323533783050> Please request an user to play with you.')
                .setFooter("are you going to play it or not")
                .setTimestamp()
            message.reply(zeroTargethEmbed)
            return
        }

        if (member.bot === true) {
            const isBotEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> You cannot play with our kind. They can't respond.")
                .setFooter('you should know it better')
                .setTimestamp()
            message.reply(isBotEmbed)
            return
        }

        new tictactoe({
            player_two: member,
            message: message
        })
    }
}