const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../mongo')
const settingsSchema = require('../../schemas/settings-schema')

const checkMark = '<:scrubgreenlarge:797816509967368213>'
const cross = '<:scrubredlarge:797816510579998730>'
const qstnMark = '<:scrubnulllarge:797816510298324992>'

const { what, green, red } = require('../../assets/json/colors.json')

module.exports = class SuggestCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'suggest',
            aliases: ['suggestion', 'idea'],
            group: 'misc',
            memberName: 'suggest',
            description: 'Suggest an idea to forward it into a suggestions channel.',
            argsType: 'single',
            format: '<string>',
            examples: ["suggest frockles should probably do something for the whole server. it's dying."],
            guildOnly: true
        })
    }

    async run(message, args) {
        const guildId = message.guild.id
        const input = args
        let channel

        await mongo().then(async (mongoose) => {
            try {
                let results = await settingsSchema.find({
                    guildId
                })

                if (results) {
                    for (let i = 0; i < results.length; i++) {
                        let { suggestionsChannel } = results[i]
                        channel = message.guild.channels.cache.get(suggestionsChannel)
                    }
                }

                if (!channel) {
                    const noSuggestChannelEmbed = new Discord.MessageEmbed()
                        .setColor(what)
                        .setDescription("<:scrubnull:797476323533783050> This server doesn't have any suggestion channel set up.")
                        .setFooter('consider asking the staffs about it')
                        .setTimestamp()
                    return message.reply(noSuggestChannelEmbed)
                }

                if (!input) {
                    const noInputEmbed = new Discord.MessageEmbed()
                        .setColor(what)
                        .setDescription("<:scrubnull:797476323533783050> You need to suggest something before you advance.")
                        .setFooter('no blank suggestions!')
                        .setTimestamp()
                    return message.reply(noInputEmbed)
                }

                if (input.length > 1024) {
                    const tooMuchEmbed = new Discord.MessageEmbed()
                        .setColor(red)
                        .setDescription("<:scrubred:797476323169533963> Your suggestion musn't have more than 1024 characters.")
                        .setFooter("that's too much")
                        .setTimestamp()
                    return message.reply(tooMuchEmbed)
                }

                const embed = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                    .setDescription(input)
                    .setFooter(`UserID: ${message.author.id}`)
                    .setTimestamp()
                channel.send(embed)
                    .then(msg => {
                        const successfulEmbed = new Discord.MessageEmbed()
                            .setColor(green)
                            .setDescription(`<:scrubgreen:797476323316465676> Successfully recorded your suggestion into ${channel}.`)
                            .setFooter('nice!')
                            .setTimestamp()
                        message.channel.send(successfulEmbed)
                        
                        msg.react(checkMark)
                        setTimeout(() => { msg.react(cross) }, 750)
                        setTimeout(() => { msg.react(qstnMark) }, 750)
                    })
            } finally {
                mongoose.connection.close()
            }
        })
    }
}