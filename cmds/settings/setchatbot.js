const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const mongo = require('../../mongo')
const settingsSchema = require('../../schemas/settings-schema')

const { green, what } = require('../../assets/json/colors.json')

module.exports = class SetChatbotChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setchatbot',
            aliases: ['setchatbotchannel'],
            group: 'settings',
            memberName: 'setchatbot',
            description: 'Set a chatbot channel.',
            details: 'Replace the syntax with `disable` if you wish to remove the configuration.',
            argsType: 'single',
            format: '<channel/channelID>',
            examples: ['setchatbot #chatbot', 'setchatbot disable'],
            userPermissions: ['ADMINISTRATOR'],
            guildOnly: true
        })
    }

    async run(message, args) {
        let guildId = message.guild.id
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args)

        await mongo().then(async (mongoose) => {
            try {
                if (!args) {
                    let results = await settingsSchema.find({
                        guildId
                    })

                    if (results) {
                        for (let i = 0; i < results.length; i++) {
                            let { chatbotChannel } = results[i]
                            if (chatbotChannel) {
                                const channelEmbed = new Discord.MessageEmbed()
                                    .setColor(what)
                                    .setDescription(`<:scrubnull:797476323533783050> **Current Chatbot Channel Configuration:** <#${chatbotChannel}>`)
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
                                chatbotChannel: channel.id
                            }
                        }, {
                            upsert: true,
                            useFindAndModify: true
                        })
                        const confirmationEmbed = new Discord.MessageEmbed()
                            .setColor(green)
                            .setDescription(`<:scrubgreen:797476323316465676> **Set the Chatbot Channel to:** ${channel}`)
                        message.channel.send(confirmationEmbed)
                        break
                    case 'disable':
                        await settingsSchema.findOneAndUpdate({
                            guildId,
                        }, {
                            guildId,
                            $set: {
                                chatbotChannel: null
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
            } finally {
                mongoose.connection.close()
            }
        })
    }
}