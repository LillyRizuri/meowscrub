const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../mongo')
const warnSchema = require('../../schemas/warn-schema')

const { what } = require('../../colors.json')

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

    async run(message) {
        const target = message.mentions.users.first()
        const guildId = message.guild.id
        const userId = target.id

        if (!target) {
            const nospecEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> No specified user for listing strikes.")
                .setFooter("mention somebody")
                .setTimestamp()
            message.reply(nospecEmbed)
            return
        }

        await mongo().then(async (mongoose) => {
            try {
                const results = await warnSchema.findOne({
                    guildId,
                    userId,
                })

                let reply = `**Previous warnings for <@${userId}>:**\n\n`

                for (const warning of results.warnings) {
                    const { author, timestamp, reason } = warning

                    reply += `+ **${author} | ${new Date(
                        timestamp
                    ).toLocaleDateString()}**:\n"${reason}"\n\n`
                }

                const warnlistEmbed = new Discord.MessageEmbed()
                    .setColor('#fffffe')
                    .setDescription(reply)
                    .setFooter("wow")
                    .setTimestamp()
                message.channel.send(warnlistEmbed)
            } finally {
                mongoose.connection.close()
            }
        })
    }
}