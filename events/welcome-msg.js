const Discord = require('discord.js')
const { embedcolor } = require('../colors.json')

const welcomeMsgEmbed = new Discord.MessageEmbed()
    .setColor(embedcolor)
    .setTitle('Frockles the Bot')
    .setThumbnail('https://i.imgur.com/Jsy9GK3.png')
    .setDescription(`
This is just a simple bot. Why do you even bother inviting it. But thanks anyway.

**Main Features**
▫ **Conventional Stuff**
Can calculate, display current weather for your desired location.
▫ **COVID-19 Stat**
I can also show some of the current COVID-19 stats in your desired place. From countries to provinces and US states.
▫ **Encoding your Text**
Encoding your text into Base64 and binary, are there. But there aren't any decoders for me unfortunately.
▫ **Have you tried Fun Stuff?**
You can use the Magic 8-Ball, list a random anime quote, turning your text into ASCII characters, and more...
▫ **Animal Photos**
You can try retrieving for some of cat, dog, or duck photos for me to randomly pick.
▫ **Not Good Moderation System**
It's not good but whatever. I only got to kick, ban, change a member's nickname.
▫ **Proud Music System**
Unlike the old days, you can now use the queue and more! Still no playlist support though.
▫ **My Music Library and Soundboard**
You can try playing some music that i have built-in, and play some soundboard too!
▫ **Simple Utilities**
Searching for discord.js Documentation, get information about the current server, and more to check for.
    `)
    .addFields({
        name: 'Adding it to your server?',
        value: `Try using \`invite\` command to get it.`
    }, {
        name: 'Support / Community',
        value: 'Join our official server! [It lies here.](https://discord.gg/fqE2yrA)'
    })
    .setFooter('Created by scrubthispie#1512 | Default prefix is -')
    .setTimestamp()

module.exports = (client) => {
    client.on('guildCreate', (guild) => {
        let channelToSend

        guild.channels.cache.forEach(channel => {
            if (
                channel.type === 'text' &&
                !channelToSend &&
                channel.permissionsFor(guild.me).has('SEND_MESSAGES')
            ) channelToSend = channel
        })

        if (!channelToSend) return

        channelToSend.send(welcomeMsgEmbed)
    })
}

