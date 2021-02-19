const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const moment = require('moment')

const { embedcolor } = require('../../colors.json')

module.exports = class ServerInfoCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'serverinfo',
            aliases: ['svinfo'],
            group: 'utility',
            memberName: 'serverinfo',
            description: "Shows some informations about this very guild.",
            guildOnly: true
        })
    }

    run(message) {
        const then = moment(message.guild.createdAt)
        const time = then.from(moment())
        const createdAt = then.format("MMM Do, YYYY")
        const communityFeatures = message.guild.features
            .join('\n').toString()
            .replace('ANIMATED_ICON', 'Animated Icon')
            .replace('BANNER', 'Banner')
            .replace('COMMERCE', 'Commerce')
            .replace('COMMUNITY', 'Community')
            .replace('DISCOVERABLE', 'Discoverable')
            .replace('FEATURABLE', 'Featurable')
            .replace('INVITE_SPLASH', 'Invite Splash')
            .replace('NEWS', 'News')
            .replace('PARTNERED', 'Partnered')
            .replace('RELAY_ENABLED', 'Relay Enabled')
            .replace('VANITY_URL', 'Vanity URL')
            .replace('VERIFIED', 'Verified')
            .replace('VIP_REGIONS', 'VIP Regions')
            .replace('WELCOME_SCREEN_ENABLED', 'Welcome Screen Enabled') || 'No Community Features'

        const serverInfoEmbed = new Discord.MessageEmbed()
            .setColor(embedcolor)
            .setAuthor(`Reports for: ${message.guild.name}`, message.guild.iconURL())
            .setThumbnail(message.guild.iconURL())
            .addFields({
                name: 'Owner',
                value: `<@${message.guild.ownerID}>`,
                inline: true
            }, {
                name: 'Created At',
                value: `${createdAt}\n(${time})`,
                inline: true
            }, {
                name: 'All Members',
                value: message.guild.memberCount - message.guild.members.cache.filter(m => m.user.bot).size,
                inline: true
            }, {
                name: 'No. of Roles',
                value: message.guild.roles.cache.size - 1,
                inline: true
            }, {
                name: 'No. of Emojis',
                value: message.guild.emojis.cache.size,
                inline: true
            }, {
                name: 'Boosting Tier',
                value: `Tier ${message.guild.premiumTier}`,
                inline: true
            }, {
                name: 'Verification Level',
                value: (message.guild.verificationLevel).toProperCase(),
                inline: true
            }, {
                name: 'Explicit Content Filter',
                value: message.guild.explicitContentFilter.replace("_", " ").toProperCase(),
                inline: true
            }, {
                name: 'Server Region',
                value: (message.guild.region).replace("-", " ").toProperCase(),
                inline: true
            }, {
                name: 'No. of Channels',
                value: `⌨️ ${message.guild.channels.cache.filter(channel => channel.type == 'text').size} | 🔈 ${message.guild.channels.cache.filter(channel => channel.type == 'voice').size} | 📁 ${message.guild.channels.cache.filter(channel => channel.type == 'category').size} | 📢 ${message.guild.channels.cache.filter(channel => channel.type == 'news').size}`,
                inline: true
            }, {
                name: 'Community Features',
                value: communityFeatures,
                inline: true
            })
            .setFooter(`ID: ${message.guild.id} | member count does exclude bots`)
            .setTimestamp()
        message.channel.send(serverInfoEmbed)
    }
}