// Official Server Only

const alexa = require('alexa-bot-api')
const ai = new alexa()

module.exports = (client) => {
    const channelId = [
        '807218230464217088'
    ]

    client.on('message', message => {
        const input = message.content
        if (message.author.bot) return
        if (channelId.includes(message.channel.id)) {
            ai.getReply(input).then(reply => {
                message.channel.send((reply).toLowerCase())
            })
        }
    })
}