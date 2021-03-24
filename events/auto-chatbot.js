const fetch = require('node-fetch')
const utf8 = require('utf8')
const settingsSchema = require('../schemas/settings-schema')
const mongo = require('../mongo')

module.exports = async (client, message) => {
    let channel
    const guildId = message.guild.id
    const input = encodeURIComponent(message.content)

    try {
        let results = await settingsSchema.find({
            guildId
        })

        for (let i = 0; i < results.length; i++) {
            let { chatbotChannel } = results[i]
            channel = chatbotChannel
        }

        if (message.author.bot) return
        if (channel.includes(message.channel.id)) {
            message.channel.startTyping()
            const response = await fetch(utf8.encode(`http://api.brainshop.ai/get?bid=${process.env.BRAINSHOP_BRAIN_ID}&key=${process.env.BRAINSHOP_API_KEY}&uid=${message.author.id}&msg=${input}`))
            const json = await response.json()
            message.channel.send(json.cnt.toLowerCase())
            return message.channel.stopTyping(true)
        }
    } catch (err) {

    }
}