module.exports = (client) => {
  const channelIds = [
    '791688962753953793'
  ]

  const addReactions = (message) => {
    message.react('<:scrubgreenlarge:797816509967368213>')

    setTimeout(() => {
      message.react('<:scrubredlarge:797816510579998730>')
    }, 750)

    setTimeout(() => {
      message.react('<:scrubnulllarge:797816510298324992>')
    }, 750)
  }
  client.on('message', async (message) => {
    if (channelIds.includes(message.channel.id)) {
      addReactions(message)
    }
  })
}