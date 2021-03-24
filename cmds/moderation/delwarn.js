const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../mongo')
const warnSchema = require('../../schemas/warn-schema')

const { green, what, red } = require('../../assets/json/colors.json')

module.exports = class DeleteWarnCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'delwarn',
            aliases: ['removestrike', 'pardon'],
            group: 'moderation',
            memberName: 'delwarn',
            description: "Delete a warn using their Warn ID.",
            argsType: 'multiple',
            format: '<@user> <WarnID>',
            examples: ['delwarn @frockles _g7tfhtshw'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true
        })
    }

    async run(message, args) {
        if (!args[0]) {
            const notargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> At least provide at least one user to delete a warn for.")
                .setFooter("are you lazy")
                .setTimestamp()
            message.reply(notargetEmbed)
            return
        }

        try {
            const target = message.mentions.users.first() || message.guild.members.cache.get(args[0]).user
            const guildId = message.guild.id
            const userId = target.id

            if (!args[1]) {
                const noIdEmbed = new Discord.MessageEmbed()
                    .setColor(what)
                    .setDescription(`<:scrubnull:797476323533783050> You need a Warn ID assigned for ${target}.`)
                    .setFooter("what's the use")
                    .setTimestamp()
                return message.reply(noIdEmbed)
            }

            const results = await warnSchema.findOne({
                guildId,
                userId
            })

            for (const warning of results.warnings) {
                const { warnId } = warning
                if (args[1] === warnId) {
                    await warnSchema.updateOne({
                        guildId,
                        userId,
                        $pull: {
                            warnings: {
                                warnId
                            }
                        }
                    })

                    const confirmationEmbed = new Discord.MessageEmbed()
                        .setColor(green)
                        .setDescription(`<:scrubgreen:797476323316465676> Deleted a warn with this ID:\n**\`${warnId}\` for ${target}.**`)
                        .setFooter(`is this fine?`)
                        .setTimestamp()
                    message.channel.send(confirmationEmbed)
                }
            }
        } catch (err) {
            const noValidUserEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> THAT'S not a valid user.")
                .setFooter("lazyyyyyy")
                .setTimestamp()
            message.reply(noValidUserEmbed)
        }
    }
}
