const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { red, what, green } = require('../../colors.json')

module.exports = class DeleteGiveawayCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'gdelete',
            aliases: ['gcancel', 'gterminate'],
            group: 'giveaway',
            memberName: 'gdelete',
            description: "Cancels out a giveaway.",
            argsType: 'single',
            format: '<messageID>',
            examples: ['gdelete 812294604249628692'],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true
        })
    }

    async run(message, args) {
        const messageID = args

        if (!messageID) {
            const notEnoughEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> A message ID of a giveaway is required.")
                .setFooter('enable dev mode')
                .setTimestamp()
            message.reply(notEnoughEmbed)
            return
        }

        this.client.giveawaysManager.delete(messageID)
            .then(() => {
                const confirmEmbed = new Discord.MessageEmbed()
                    .setColor(green)
                    .setDescription(`<:scrubgreen:797476323316465676> Terminated the giveaway with this ID: \`${messageID}\`.`)
                    .setFooter('seriously what did you do')
                    .setTimestamp()
                message.reply(confirmEmbed)
            }).catch((err) => {
                const errorEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription(`<:scrubred:797476323169533963> Absolutely no ongoing giveaways match with \`${messageID}\`.`)
                    .setFooter('thonking')
                    .setTimestamp()
                message.reply(errorEmbed)
            })
    }
}