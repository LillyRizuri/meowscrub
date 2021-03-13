const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const utf8 = require('utf8')
const base64 = require('base-64')

const { red, what, embedcolor } = require('../../assets/json/colors.json')

module.exports = class Base64Command extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'base64',
            group: 'encoders',
            memberName: 'base64',
            description: 'To Base64. And reverse.',
            details: 'All text output will be encoded in UTF-8.',
            argsType: 'multiple',
            format: '<encode/decode> <string>',
            examples: ['base64 encode never gonna give you up']
        })
    }

    run(message, args) {
        const text = args

        if (!args[0]) {
            const noArgsEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription('<:scrubnull:797476323533783050> The parameter is blank.\nEither you need to `encode`, or `decode`.')
                .setFooter('otherwise get out')
                .setTimestamp()
            message.reply(noArgsEmbed)
            return
        }

        if (!args[1]) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> I can't do anything without some text.")
                .setFooter('go type something')
                .setTimestamp()
            return message.reply(noInputEmbed)
        }

        const param = args[0].toLowerCase()
        const input = args.slice(1).join(' ')

        switch (param) {
            case 'encode':
                const formattedInput = utf8.encode(input)
                const encoded = base64.encode(formattedInput)

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
                const decoded = base64.decode(input)
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