const Commando = require('discord.js-commando')

const mongo = require('../../mongo')
const afkSchema = require('../../schemas/afk-schema')

module.exports = class AFKCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'afk',
            aliases: ['idle'],
            group: 'misc',
            memberName: 'afk',
            description: 'Set yourself an AFK status.',
            argsType: 'single',
            format: '[reason]',
            examples: ['afk coding time'],
            guildOnly: true
        })
    }

    async run(message, args) {
        let afkMessage = args
        let userId = message.author.id
        let guildId = message.guild.id

        if (!afkMessage) {
            afkMessage = 'AFK'
        }

        await afkSchema.findOneAndUpdate({
            guildId,
            userId
        }, {
            guildId,
            userId,
            $set: {
                afk: afkMessage,
                timestamp: new Date().getTime(),
                username: message.member.nickname === null ? message.author.username : message.member.nickname
            }
        }, {
            upsert: true,
            useFindAndModify: false
        })


        await message.member.setNickname(`[AFK] ${message.member.nickname === null ? `${message.author.username}` : `${message.member.nickname}`}`)
            .catch(err => { })
        return message.reply(`I set your AFK status to: ${afkMessage}`)
    }
}