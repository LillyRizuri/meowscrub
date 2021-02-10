const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const economy = require('../../economy')

const { red, green, what } = require('../../colors.json')

module.exports = class AddbalCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addbalance',
            aliases: ['addbal'],
            group: 'economy',
            memberName: 'addbalance',
            description: "Print & give them some money.",
            argsType: 'multiple',
            argsCount: '2',
            format: '<@user> <number>',
            examples: ['addbalance @frockles 10000'],
            clientPermissions: ['MANAGE_GUILD'],
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true
        })
    }
    async run(message, args) {
        const mention = message.mentions.users.first()

        if (!mention) {
            const balerrorEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Do tag a user to give them money.")
                .setFooter("bleh")
                .setTimestamp()
            message.reply(balerrorEmbed)
            return
        }

        const coins = args[1]
        if (isNaN(coins)) {
            const balnanEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Do you want to give them text instead of money?")
                .setFooter("wtf")
                .setTimestamp()
            message.reply(balnanEmbed)
            return
        }

        if (coins < 0) {
            const negacoinsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value.")
                .setFooter("fool")
                .setTimestamp()
            message.reply(negacoinsEmbed)
            return
        }


        const guildId = message.guild.id
        const userId = mention.id

        const newCoins = await economy.addCoins(guildId, userId, coins)

        const addbalEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription(`
<:scrubgreen:797476323316465676> Successfully added <@${userId}> **¢${coins}**

<@${userId}>'s Current Balance: **¢${newCoins}**`)
            .setFooter("hmmmmmm")
            .setTimestamp()
        message.reply(addbalEmbed)
    }
}