const fetch = require('node-fetch')
const settingsSchema = require('../schemas/settings-schema')
const mongo = require('../mongo')

module.exports = async (client, message) => {
    const guildId = message.guild.id
    const input = encodeURIComponent(message.content)

    try {
        await mongo().then(async (mongoose) => {
            try {
                let results = await settingsSchema.find({
                    guildId
                })

                if (results) {
                    for (let i = 0; i < results.length; i++) {
                        let { chatbotChannel } = results[i]
                        if (message.author.bot) return
                        if (chatbotChannel.includes(message.channel.id)) {
                            message.channel.startTyping()
                            const response = await fetch(`${process.env.BRAINSHOP}&uid=1&msg=${input}`)
                            const json = await response.json()
                            message.channel.send(json.cnt.toLowerCase())
                            return message.channel.stopTyping(true)
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