const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../mongo')
const warnSchema = require('../../schemas/warn-schema')

const { what, red, embedcolor } = require('../../assets/json/colors.json')

module.exports = class WarningsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'warnings',
            aliases: ['listwarn', 'listwarnings'],
            group: 'moderation',
            memberName: 'warnings',
            description: "Check the warn list of somebody.",
            argsType: 'single',
            format: '<@user>',
            examples: ['warnings @frockles'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true
        })
    }

    async run(message, args) {
        if (!args) {
            const nospecEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> No specified user for listing strikes.")
                .setFooter("mention somebody")
                .setTimestamp()
            message.reply(nospecEmbed)
            return
        }

        try {
            const target = message.mentions.users.first() || message.guild.members.cache.get(args).user
            const guildId = message.guild.id
            const userTag = target.tag
            const userAvatar = target.displayAvatarURL({ dynamic: true })
            const userId = target.id

            await mongo().then(async (mongoose) => {
                try {
                    try {
                        const results = await warnSchema.findOne({
                            guildId,
                            userId,
                        })

                        let reply = ''

                        for (const warning of results.warnings) {
                            const { author, timestamp, warnId, reason } = warning

                            reply += `+ **ID: ${warnId} | ${author}**\n"${reason}" - ${new Date(timestamp).toLocaleDateString()}\n\n`
                        }

                        const warnlistEmbed = new Discord.MessageEmbed()
                            .setColor(embedcolor)
                            .setAuthor(`Previous warnings for ${userTag}`, userAvatar)
                            .setDescription(reply)
                            .setFooter("wow")
                            .setTimestamp()
                        message.channel.send(warnlistEmbed)
                    } catch (err) {
                        const noWarningsEmbed = new Discord.MessageEmbed()
                            .setColor(red)
                            .setDescription("<:scrubred:797476323169533963> There's no warnings for that user.")
                            .setFooter("bruh")
                            .setTimestamp()
                        return message.reply(noWarningsEmbed)

                    }
                } finally {
                    mongoose.connection.close()
                }
            })
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