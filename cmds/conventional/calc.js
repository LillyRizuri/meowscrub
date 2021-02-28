const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const math = require('mathjs')

const { what, red, embedcolor } = require('../../assets/json/colors.json')

module.exports = class AddCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'calc',
            aliases: ['calculate', 'math'],
            group: 'conventional',
            memberName: 'calc',
            description: 'You can do calculation with Math.js. Check mathjs.org for more information.',
            argsType: 'single',
        })
    }

    run(message, args) {
        if (!args) {
            const noInputEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription('<:scrubnull:797476323533783050> Provide a question in order to continue.')
                .setFooter("don't want to do math? go away.")
                .setTimestamp()
            return message.reply(noInputEmbed)
        }

        let response
        try {
            response = math.evaluate(args)
        } catch (err) {
            const notValidEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription('<:scrubred:797476323169533963> THAT is not a valid question.')
                .setFooter("go away please")
                .setTimestamp()
            return message.reply(notValidEmbed)
        }

        const validAnswerEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor("Math.js Calculator")
            .addFields({
                name: 'Math Problem',
                value: `\`\`\`css\n${args}\`\`\``,
                inline: true
            }, {
                name: "Problem's Answer",
                value: `\`\`\`css\n${response}\`\`\``,
                inline: true
            })
            .setFooter('hope it helps')
            .setTimestamp()
        message.channel.send(validAnswerEmbed)
    }
}