const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const ms = require('ms')

const { red, what, green } = require('../../colors.json')

module.exports = class CreateGiveawayCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'gstart',
            aliases: ['gcreate'],
            group: 'giveaway',
            memberName: 'gstart',
            description: "Create a giveaway!",
            argsType: 'multiple',
            format: '<#channel> <duration> <winners> <name>',
            examples: ['gstart #giveaway 30m 5 Awesome T-Shirt'],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true
        })
    }

    async run(message, args) {
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0])
        const giveawayDuration = args[1]
        const giveawayWinners = Number(args[2])
        const giveawayPrize = args.slice(3).join(" ")

        if (!channel || !giveawayDuration || !giveawayWinners || !giveawayPrize) {
            const notEnoughEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> You didn't provide all of the arguments.")
                .setFooter(`Example: ${message.guild.commandPrefix}gstart #giveaway 30m 5 Awesome T-Shirt`)
                .setTimestamp()
            message.reply(notEnoughEmbed)
            return
        }

        if (ms(giveawayDuration) < 10000 || ms(giveawayDuration) > 1209600000) {
            const invalidDurEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> The duration mustn't be less than 10 seconds and more than 2 weeks.")
                .setFooter('mind trying again?')
                .setTimestamp()
            message.reply(invalidDurEmbed)
            return
        }

        if (giveawayWinners < 1 || giveawayWinners > 20 || !Number.isInteger(giveawayWinners)) {
            const invalidWinnersEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> There should be only at least 1 winner and no more than 20.")
                .setFooter('mind trying again?')
                .setTimestamp()
            message.reply(invalidWinnersEmbed)
            return
        }

        this.client.giveawaysManager.start(channel, {
            time: ms(giveawayDuration),
            prize: giveawayPrize,
            winnerCount: giveawayWinners,
            hostedBy: message.author,
            messages: {
                giveaway: "🎉   **GIVEAWAY**   🎉",
                giveawayEnded: "🎉 **GIVEAWAY ENDED** 🎉",
                timeRemaining: "Remaining Time: **{duration}**",
                inviteToParticipate: "React with 🎉 to enter!",
                winMessage: "Congratulations {winners}, you won the **{prize}**!\n{messageURL}",
                embedFooter: "Good luck.",
                noWinner: "Couldn't determine a winner. Too bad.",
                hostedBy: "Hosted by: {user}",
                winners: "winner(s)",
                endedAt: "Ended at",
                units: {
                    seconds: "seconds",
                    minutes: "minutes",
                    hours: "hours",
                    days: "days",
                    pluralS: false
                }
            }
        })
            .then(() => {
                const confirmEmbed = new Discord.MessageEmbed()
                    .setColor(green)
                    .setDescription(`<:scrubgreen:797476323316465676> Giveaway established in ${channel} for \`${giveawayPrize}\`.`)
                    .setFooter('good luck, participants.')
                    .setTimestamp()
                message.reply(confirmEmbed)
            })
            .catch(err => {
                const errorEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription(`<:scrubred:797476323169533963> Illegal arguments detected. Please try again.`)
                    .setFooter(err)
                    .setTimestamp()
                message.reply(errorEmbed)
            })
    }
}