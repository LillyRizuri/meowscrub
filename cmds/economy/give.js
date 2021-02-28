const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const economy = require('../../economy')

const { red, green, what } = require('../../assets/json/colors.json')

module.exports = class GiveCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'give',
            aliases: ['pay'],
            group: 'economy',
            memberName: 'give',
            description: "Feel free to share some coins if needed.",
            argsType: 'multiple',
            argsCount: '2',
            format: '<@user> <number>',
            examples: ['give @frockles 1000'],
            guildOnly: true
        })
    }

    async run(message, args) {
        const { guild, member } = message

        const target = message.mentions.users.first()
        if (!target) {
            const nouserEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Please specify someone to give coins to.")
                .setFooter("are you planning on making a payment")
                .setTimestamp()
            message.reply(nouserEmbed)
            return
        }

        const coinsToGive = args[1]
        if (isNaN(coinsToGive)) {
            const nancoinsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Why are you giving text instead of coins?")
                .setFooter("giving texts are useless y'know")
                .setTimestamp()
            message.reply(nancoinsEmbed)
            return
        }

        if (coinsToGive < 0) {
            const negacoinsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Don't even try breaking me using a simple negative value.")
                .setFooter("fool")
                .setTimestamp()
            message.reply(negacoinsEmbed)
            return
        }

        const coinsOwned = await economy.getCoins(guild.id, member.id)
        if (coinsOwned < coinsToGive) {
            const nocoinsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription(`<:scrubred:797476323169533963> There's no **¢${coinsToGive}** on your pocket.`)
                .setFooter("nruh")
                .setTimestamp()
            message.reply(nocoinsEmbed)
            return
        }

        const remainingCoins = await economy.addCoins(
            guild.id,
            member.id,
            coinsToGive * -1
        )
        const newBalance = await economy.addCoins(
            guild.id,
            target.id,
            coinsToGive
        )

        const givebalEmbed = new Discord.MessageEmbed()
            .setColor(green)
            .setDescription(`
<:scrubgreen:797476323316465676> <@${target.id}> has received **¢${coinsToGive}** from you!

<@${target.id}>'s Current Balance: **¢${newBalance}**
Your Current Balance: **¢${remainingCoins}**`)
            .setFooter("hmmmmmm")
            .setTimestamp()
        message.reply(givebalEmbed)
    }
}