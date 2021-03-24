const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../mongo')
const settingsSchema = require('../../schemas/settings-schema')

const { green, what } = require('../../assets/json/colors.json')

module.exports = class SetChatbotChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setsuggestion',
            aliases: ['setsuggestionchannel'],
            group: 'settings',
            memberName: 'setsuggestion',
            description: 'Set a suggestion channel.',
            details: 'Replace the syntax with `disable` if you wish to remove the configuration.',
            argsType: 'single',
            format: '<channel/channelID>',
            examples: ['setsuggestion #chatbot', 'setsuggestion disable'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true
        })
    }

    async run(message, args) {
        let guildId = message.guild.id
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args)

        if (!args) {
            let results = await settingsSchema.find({
                guildId
            })

            if (results) {
                for (let i = 0; i < results.length; i++) {
                    let { suggestionsChannel } = results[i]
                    if (suggestionsChannel) {
                        const channelEmbed = new Discord.MessageEmbed()
                            .setColor(what)
                            .setDescription(`<:scrubnull:797476323533783050> **Current Chatbot Channel Configuration:** <#${suggestionsChannel}>`)
                        return message.channel.send(channelEmbed)
                    }
                }
            }
        }

        switch (args) {
            default:
                if (!channel) {
                    const noValidChannelEmbed = new Discord.MessageEmbed()
                        .setColor(what)
                        .setDescription("<:scrubnull:797476323533783050> No valid channel found for the configuration.")
                        .setFooter('can you try again once more?')
                        .setTimestamp()
                    return message.reply(noValidChannelEmbed)
                }
                await settingsSchema.findOneAndUpdate({
                    guildId,
                }, {
                    guildId,
                    $set: {
                        suggestionsChannel: channel.id
                    }
                }, {
                    upsert: true,
                    useFindAndModify: true
                })
                const confirmationEmbed = new Discord.MessageEmbed()
                    .setColor(green)
                    .setDescription(`<:scrubgreen:797476323316465676> **Set the Suggestion Channel to:** ${channel}`)
                message.channel.send(confirmationEmbed)
                break
            case 'disable':
                await settingsSchema.findOneAndUpdate({
                    guildId,
                }, {
                    guildId,
                    $set: {
                        suggestionsChannel: null
                    }
                }, {
                    upsert: true,
                    useFindAndModify: true
                })
                const confirmationRemovalEmbed = new Discord.MessageEmbed()
                    .setColor(green)
                    .setDescription("<:scrubgreen:797476323316465676> **Removed the configuration for the Chatbot Channel.**")
                message.channel.send(confirmationRemovalEmbed)
                return
        }
    }
}