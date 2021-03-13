const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const utf8 = require('utf8')

const { red, what, embedcolor } = require('../../assets/json/colors.json')

module.exports = class BinaryCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'binary',
            group: 'encoders',
            memberName: 'binary',
            description: 'To binaries. And reverse.',
            details: 'All text output will be encoded in UTF-8.',
            argsType: 'multiple',
            format: '<encode/decode> <string>',
            examples: ['binary never', 'binary decode 01101110 01100101 01110110 01100101 01110010']
        })
    }

    run(message, args) {
        if (!args[0]) {
            const noParamEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> There's no parameter set.\nEither it's by `encode`, or `decode`.")
                .setFooter("how am i supposed to do anything lol")
                .setTimestamp()
            return message.reply(noParamEmbed)
        }

        if (!args[1]) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> I can't do anything without some text.")
                .setFooter('go do it or something')
                .setTimestamp()
            return message.reply(noInputEmbed)
        }

        const param = args[0].toLowerCase()
        const input = args.slice(1).join(' ')

        function encode(char) {
            return char.split('').map(str => {
                const encoded = str.charCodeAt(0).toString(2)
                return encoded.padStart(8, '0')
            })
                .join(' ')
        }

        function decode(char) {
            return char.split(' ').map(str => String.fromCharCode(Number.parseInt(str, 2))).join('')
        }

        switch (param) {
            case 'encode':
                const formattedInput = utf8.encode(input)
                const encoded = encode(formattedInput)

                if (encoded.length > 2042) {
                    const tooMuchEmbed = new Discord.MessageEmbed()
                        .setColor(red)
                        .setDescription('<:scrubred:797476323169533963> Your provided input is probably too much.')
                        .setFooter('try again')
                        .setTimestamp()
                    return message.reply(tooMuchEmbed)
                }

                const encodedEmbed = new Discord.MessageEmbed()
                    .setColor(embedcolor)
                    .setAuthor('Encoded to:')
                    .setDescription(`\`\`\`${encoded}\`\`\``)
                    .setTimestamp()
                message.channel.send(encodedEmbed)
                return
            case 'decode':
                const decoded = decode(input)
                const formattedOutput = utf8.decode(decoded)

                if (formattedOutput.length > 2042) {
                    const tooMuchEmbed = new Discord.MessageEmbed()
                        .setColor(red)
                        .setDescription('<:scrubred:797476323169533963> Your provided input is probably too much.')
                        .setFooter('try again')
                        .setTimestamp()
                    return message.reply(tooMuchEmbed)
                }

                const decodedEmbed = new Discord.MessageEmbed()
                    .setColor(embedcolor)
                    .setAuthor('Decoded to:')
                    .setDescription(`\`\`\`${formattedOutput}\`\`\``)
                    .setTimestamp()
                message.channel.send(decodedEmbed)
                return
            default:
                const invalidParamEmbed = new Discord.MessageEmbed()
                    .setColor(red)
                    .setDescription("<:scrubred:797476323169533963> THAT'S not a valid parameter.\nEither it's by `encode`, or `decode`.")
                    .setFooter('try again')
                    .setTimestamp()
                message.reply(invalidParamEmbed)
                return
        }
    }
}