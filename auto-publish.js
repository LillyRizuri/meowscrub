module.exports = (client) => {
    client.on('message', (message) => {
        const { channel } = message

        try {
            if (channel.type === 'news') {
                setTimeout(function () {
                    message.crosspost()
                    console.log('Published News.')
                }, 5000)
            }
        } catch (err) {
            console.log(err)
        }
    })
}