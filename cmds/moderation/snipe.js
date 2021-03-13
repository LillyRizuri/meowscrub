const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { embedcolor, what, red } = require('../../assets/json/colors.json')

module.exports = class SnipeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'snipe',
            group: 'moderation',
            memberName: 'snipe',
            description: "Reveals the latest deleted message.",
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
                selectedChannel = message.mentions.channels.first()
            } else if (args) {
                selectedChannel = message.guild.channels.cache.get(args)
            } else {
                selectedChannel = message.channel
            }
        } catch (err) {
            const notValidChannelEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> That ISN'T a valid Channel ID.")
                .setFooter('what is a snowflake to you')
                .setTimestamp()
            return message.reply(notValidChannelEmbed)
        }

        if (selectedChannel.nsfw === true) {
            const isNsfwEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription("<:scrubred:797476323169533963> Sniping in an NSFW channel is prohibited.")
                .setFooter('what the hell')
                .setTimestamp()
            return message.reply(isNsfwEmbed)
        }

        const snipe = this.client.snipe.get(selectedChannel.id)
        if (!snipe) {
            const noMsgEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> There's no latest deleted message.")
                .setFooter('lol')
                .setTimestamp()
            return message.reply(noMsgEmbed)
        }

        const snipedEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(snipe.authorTag, snipe.avatar)
            .setFooter(`UserID: ${snipe.authorId}`)
            .setTimestamp(snipe.createdAt)
        if (snipe.attachments) {
            snipedEmbed
                .setImage(snipe.attachments)
                .setDescription(`${snipe.content}\n[\`Attachment\`](${snipe.attachments})`)
        } else {
            snipedEmbed
                .setDescription(snipe.content)
        }
        message.channel.send(snipedEmbed)
    }
}