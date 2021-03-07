const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor, what, red } = require('../../assets/json/colors.json')

module.exports = class EditSnipeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'editsnipe',
            group: 'moderation',
            memberName: 'editsnipe',
            description: "Reveals the latest before-edited message.",
            details: "Leave the argument blank to check for the channel the command was run in.",
            argsType: 'single',
            format: '[#channel/channelID]',
            examples: ['editsnipe #general', 'editsnipe 750858623843827812', 'editsnipe'],
            userPermissions: ['MANAGE_MESSAGES'],
            guildOnly: true
        })
    }

    run(message, args) {
        let selectedChannel

        try {
            if (message.mentions.channels.first()) {
                selectedChannel = message.mentions.channels.first().id
            } else if (args) {
                selectedChannel = message.guild.channels.cache.get(args).id
            } else {
                selectedChannel = message.channel.id
            }
        } catch (err) {
            const notValidChannelEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> That ISN'T a valid Channel ID.")
                .setFooter('what is a snowflake to you')
                .setTimestamp()
            return message.reply(notValidChannelEmbed)
        }

        const editsnipe = this.client.editsnipe.get(selectedChannel)
        if (!editsnipe) {
            const noMsgEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> There's no latest edited message.")
                .setFooter('lol')
                .setTimestamp()
            return message.reply(noMsgEmbed)
        }

        const editSnipedEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(editsnipe.authorTag, editsnipe.avatar)
            .setDescription(editsnipe.content)
            .setFooter(`UserID: ${editsnipe.authorId}`)
            .setTimestamp(editsnipe.createdAt)
        if (editsnipe.attachments) {
            editSnipedEmbed
                .setImage(editsnipe.attachments)
                .setDescription(`${editsnipe.content}\n[Attachment](${editsnipe.attachments})`)
        } else {
            editSnipedEmbed
                .setDescription(editsnipe.content)
        }
        message.channel.send(editSnipedEmbed)
    }
}