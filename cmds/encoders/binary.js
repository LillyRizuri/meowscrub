const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const fetch = require('node-fetch')

const { red, what } = require('../../assets/json/colors.json')

module.exports = class BinaryCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'binary',
            group: 'encoders',
            memberName: 'binary',
            description: 'To binaries.',
            argsType: 'single',
            format: '<string>',
            examples: ['binary hello world']
        })
    }

    run(message, args) {
        const text = args

        if (!text) {
            const noArgsEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription('<:scrubnull:797476323533783050> Provide an input in order to continue.')
                .setFooter('otherwise get out')
                .setTimestamp()
            message.reply(noArgsEmbed)
            return
        }

        fetch(`https://some-random-api.ml/binary?text=${text}`)
            .then(res => res.json())
            .then(json => {
                if (json.binary.length > 2042) {
                    const tooMuchEmbed = new Discord.MessageEmbed()
                        .setColor(red)
                        .setDescription('<:scrubred:797476323169533963> Your provided text is probably too much.')
                        .setFooter('try again')
                        .setTimestamp()
                    return message.reply(tooMuchEmbed)
                }

                const embed = new Discord.MessageEmbed()
                    .setColor('RANDOM')
                    .setAuthor('Encoded to:')
                    .setDescription(`\`\`\`${json.binary}\`\`\``)
                    .setTimestamp()
                message.channel.send(embed)
            })
    }
}