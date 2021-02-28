const moment = require('moment')
const afkSchema = require('../schemas/afk-schema')
const mongo = require('../mongo')

module.exports = async (client, message) => {
    const guildId = message.guild.id
    if (message.author.bot) return
    try {
        await mongo().then(async (mongoose) => {
            try {
                if (message.mentions.members.first()) {
                    let results = await afkSchema.find({
                        guildId,
                    })

                    if (results) {
                        for (let i = 0; i < results.length; i++) {
                            let { userId, afk, timestamp } = results[i]
                            switch (message.mentions.members.first().id) {
                                case message.author.id:
                                    return
                                case userId:
                                    let user = message.guild.members.cache.get(userId).user
                                    return message.channel.send(`${user.username} is currently AFK: ${afk} - ${moment(timestamp).fromNow()}`)
                            }
                        }
                    }
                }

                let afkResults = await afkSchema.find({
                    guildId
                })

                if (afkResults) {
                    for (let i = 0; i < afkResults.length; i++) {
                        let { userId, timestamp, username } = afkResults[i]

                        if (timestamp + (1000 * 30) <= new Date().getTime()) {

                            if (message.author.id === userId) {
                                await afkSchema.findOneAndDelete({
                                    guildId,
                                    userId
                                })

                                message.member.setNickname(`${username}`)
                                    .catch(err => { })

                                return message.channel.send(`Welcome back, <@${userId}>, I removed your AFK status.`)
                            }
                        }
                    }
                }
            } finally {
                mongoose.connection.close()
            }
        })
    } catch (err) {

    }
}




