const Commando = require('discord.js-commando')
const Discord = require('discord.js')

module.exports = class InviteBotCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'invite',
            group: 'conventional',
            memberName: 'invite',
            description: 'Invite link for me to join your server.',
        })
    }

    run(message) {
        const inviteEmbed = new Discord.MessageEmbed()
            .setColor('RANDOM')
            .setDescription('The link that invites me with up-to-date features, [lies here.](https://discord.com/oauth2/authorize?client_id=693832549943869493&scope=bot&permissions=2083911167)')
        message.channel.send(inviteEmbed)

    }
}