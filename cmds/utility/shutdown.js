const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor, red } = require('../../colors.json')
const checkMark = '<:scrubgreenlarge:797816509967368213>'
const cross = '<:scrubredlarge:797816510579998730>'
const { ownerId } = require('../../config.json')

module.exports = class ShutdownCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'shutdown',
            aliases: ['destroy', 'terminate'],
            group: 'utility',
            memberName: 'shutdown',
            description: "Shut the actual bot down. No joke.",
            details: 'Only the bot owner(s) may use this command.',
        })
    }

    async run(message, args) {
        if (message.author.id !== ownerId) {
            const notBotOwnerEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription('<:scrubred:797476323169533963> THIS COMMAND IS VERY DANGEROUS AND IT WILL MAKE THE CLIENT SHUT DOWN.')
                .setFooter("YOU CAN'T TAMPER. THIS IS NO JOKE.")
                .setTimestamp()
            return message.reply(notBotOwnerEmbed)
        }

        const confirmationEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(`Initiated by ${message.author.tag}, the Owner`, message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(`
The entire client seesion will be destroyed.
Please confirm with a check mark or with a red cross.        
        `)
        message.reply(confirmationEmbed)
            .then(msg => {
                msg.react(checkMark)
                setTimeout(() => {
                    msg.react(cross)
                }, 750)

                msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == 'scrubgreenlarge' || reaction.emoji.name == 'scrubredlarge'),
                    { max: 1, time: 30000 }).then(async collected => {
                        if (collected.first().emoji.name == 'scrubgreenlarge') {
                            try {
                                await message.channel.send("*The client has been put to rest.*")
                            } finally {
                                process.exit()
                            }
                        } else
                            message.channel.send('Operation canceled. Phew.');
                    }).catch(() => {
                        message.channel.send('No reaction after 30 seconds, operation canceled.');
                    })
            })



    }
}