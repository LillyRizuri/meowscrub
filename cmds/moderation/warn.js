const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../mongo')
const warnSchema = require('../../schemas/warn-schema')

const { green, what } = require('../../assets/json/colors.json')

module.exports = class WarnCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            aliases: ['strike'],
            group: 'moderation',
            memberName: 'warn',
            description: "Warn somebody.",
            argsType: 'multiple',
            format: '<@user> [reason]',
            examples: ['warn @frockles spamming'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true
        })
    }

    async run(message, args) {
        const target = message.mentions.users.first()
        if (!target) {
            const notargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> At least provide at least one user to warn.")
                .setFooter("bruh")
                .setTimestamp()
            message.reply(notargetEmbed)
            return
        }

        args.shift()

        const guildId = message.guild.id
        const userId = target.id
        const reason = args.join(' ')

        const warning = {
            author: message.member.user.tag,
            timestamp: new Date().getTime(),
            reason,
        }

        await mongo().then(async (mongoose) => {
            try {
                await warnSchema.findOneAndUpdate(
                    {
                        guildId,
                        userId,
                    },
                    {
                        guildId,
                        userId,
                        $push: {
                            warnings: warning,
                        },
                    },
                    {
                        upsert: true,
                    }
                )

                const warnedEmbed = new Discord.MessageEmbed()
                    .setColor(green)
                    .setDescription(`<:scrubgreen:797476323316465676> **<@${userId}> has been warned.**`)
                    .setFooter("what the heck did you just do rule-breaker")
                    .setTimestamp()
                message.channel.send(warnedEmbed)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}
