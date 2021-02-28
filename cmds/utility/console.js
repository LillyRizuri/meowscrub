const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const process = require('child_process')

const { red, what } = require('../../assets/json/colors.json')
const { ownerId } = require('../../config.json')

module.exports = class AvatarCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'console',
            aliases: ['shell', 'terminal'],
            group: 'utility',
            memberName: 'console',
            description: "Run the bot's own terminal.",
            details: 'Only the bot owner(s) may use this command.',
            argsType: 'single',
            format: '<input>',
        })
    }

    run(message, args) {
        if (message.author.id !== ownerId) {
            const notBotOwnerEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription('<:scrubnull:797476323533783050> You are not a bot owner. Stop.')
                .setFooter('this can allow people to tamper with me')
                .setTimestamp()
            return message.reply(notBotOwnerEmbed)
        }

        if (args.startsWith('node')) {
            const runningNodeEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Please don't initialize any **node.js**-related commands.")
                .setFooter('please')
                .setTimestamp()
            return message.reply(runningNodeEmbed)
        }

        message.channel.send(`\`\`\`Initializing the Terminal...\`\`\``);
        process.exec(args, (error, stdout) => {
            let result = (stdout || error);
            message.channel.send(result, {
                code: "asciidoc",
                split: "\n"
            }).catch(err => {
                message.reply(`The terminal has encountered some error.\n\`\`\`${err}\`\`\``)
            })
        })
    }
}