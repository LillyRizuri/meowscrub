const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const request = require('request')

const { what, red } = require('../../colors.json')

module.exports = class AsciiCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ascii',
            group: 'funs',
            memberName: 'ascii',
            description: "Create an ASCII art using text. Won't look pretty on mobile though.",
            argsType: 'single',
            format: '<string>'
        })
    }

    run(message, args) {
        const input = args

        if (!input) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Input some texts to advance.")
                .setFooter("it's not ascii when there isn't text")
                .setTimestamp()
            return message.reply(noInputEmbed)
        }

        if (input.length > 20) {
            const inputOverLimitEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Exceeding the 20 characters limit can be... **Dangerous.**")
                .setFooter("for legal reasons")
                .setTimestamp()
            return message.reply(inputOverLimitEmbed)
        }

        request("https://artii.herokuapp.com/make?text=" + input, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                message.channel.send(`\`\`\`${body}\`\`\``)
            } else {
                message.reply("An error from the API side has occured. Try something else or try again later.")
            }
        })
    }
}