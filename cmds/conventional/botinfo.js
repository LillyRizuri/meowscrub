const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const { version, author } = require('../../package.json')

const { embedcolor } = require('../../colors.json')

module.exports = class BotInfoCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'botinfo',
            group: 'conventional',
            memberName: 'botinfo',
            description: "Get and display my informations.",
        })
    }

    async run(message) {
        let totalMembers = 0

        for (const guild of this.client.guilds.cache) {
            totalMembers += (await guild[1].members.fetch()).size
        }
        const botinfoEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(`About ${this.client.user.username}`,
                this.client.user.displayAvatarURL()
            )
            .addFields({
                name: 'Client Version',
                value: version,
                inline: true
            }, {
                name: 'Cmd. Framework',
                value: 'Commando',
                inline: true
            }, {
                name: 'Bot Creator',
                value: author,
                inline: true
            }, {
                name: 'Servers Currently In',
                value: this.client.guilds.cache.size,
                inline: true
            }, {
                name: 'Members Served',
                value: totalMembers,
                inline: true
            }, {
                name: 'Invite the Bot',
                value: '[Test Bot Invite](https://discord.com/oauth2/authorize?client_id=794604500111327242&scope=bot&permissions=2083911167)',
                inline: true
            }, {
                name: 'Support/Community',
                value: '[Server Invite](https://discord.gg/fqE2yrA)',
                inline: true
            })
            .setFooter(`Time since last restart: ${process.uptime().toFixed(2)}s`)
        message.channel.send(botinfoEmbed)
    }
}