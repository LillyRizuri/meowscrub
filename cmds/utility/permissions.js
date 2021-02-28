const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const yes = '✔️'
const no = '❌'
const x = "```"
const s = '📛'
const c = '♨️'

const permissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
]

const { red, embedcolor } = require('../../assets/json/colors.json')

module.exports = class UserPermissionsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'permissions',
            aliases: ['perms', 'checkperms'],
            group: 'utility',
            memberName: 'permissions',
            description: "Shows your, or a specified user's permission.",
            argsType: 'single',
            format: '[@user]',
            examples: ['permissions @frockles'],
            guildOnly: true
        })
    }

    run(message, args) {
        let user

        try {
            if (message.mentions.users.first()) {
                user = message.mentions.users.first()
            } else if (args) {
                user = message.guild.members.cache.get(args).user
            } else {
                user = message.author
            }

            const member = message.guild.members.cache.get(user.id)


            let description = `Server - ${s}\nCurrent Channel - ${c}\n\n${s} | ${c}\n`

            const permListEmbed = new Discord.MessageEmbed()
                .setColor(embedcolor)
                .setAuthor(`${user.tag}'s Permissions`)
            permissions.forEach(perm => {
                description += `${member.permissions.has(perm) ? yes : no} | ${message.channel.permissionsFor(user.id).has(perm) ? yes : no} - ${perm
                    .replace('CREATE_INSTANT_INVITE', 'Create Invite')
                    .replace('KICK_MEMBERS', 'Kick Members')
                    .replace('BAN_MEMBERS', 'Ban Members')
                    .replace('ADMINISTRATOR', 'Administrator')
                    .replace('MANAGE_CHANNELS', 'Manage Channels')
                    .replace('MANAGE_GUILD', 'Manage Guild')
                    .replace('ADD_REACTIONS', 'Add Reactions')
                    .replace('VIEW_AUDIT_LOG', 'View Audit Log')
                    .replace('PRIORITY_SPEAKER', 'Priority Speaker')
                    .replace('STREAM', 'Stream')
                    .replace('VIEW_CHANNEL', 'View Channel')
                    .replace('SEND_MESSAGES', 'Send Messages')
                    .replace('SEND_TTS_MESSAGES', 'Send TTS Messages')
                    .replace('MANAGE_MESSAGES', 'Manage Messages')
                    .replace('EMBED_LINKS', 'Embed Links')
                    .replace('ATTACH_FILES', 'Attach Files')
                    .replace('READ_MESSAGE_HISTORY', 'Read Message History')
                    .replace('MENTION_EVERYONE', 'Mention Everyone')
                    .replace('USE_EXTERNAL_EMOJIS', 'Use External Emojis')
                    .replace('VIEW_GUILD_INSIGHTS', 'View Guild Insights')
                    .replace('CONNECT', 'Connect')
                    .replace('SPEAK', 'Speak')
                    .replace('MUTE_MEMBERS', 'Mute Members')
                    .replace('DEAFEN_MEMBERS', 'Deafen Members')
                    .replace('MOVE_MEMBERS', 'Move Members')
                    .replace('USE_VAD', 'Use VAD')
                    .replace('CHANGE_NICKNAME', 'Change Nickname')
                    .replace('MANAGE_NICKNAMES', 'Manage Nicknames')
                    .replace('MANAGE_ROLES', 'Manage Roles')
                    .replace('MANAGE_WEBHOOKS', 'Manage Webhooks')
                    .replace('MANAGE_EMOJIS', 'Manage Emojis')}\n`
            })
            permListEmbed.setDescription(x + description + x)
            message.channel.send(permListEmbed)
        } catch (err) {
            const notValidIDEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription('<:scrubred:797476323169533963> What are you trying to do with that invalid user ID?')
                .setFooter('you fool')
                .setTimestamp()
            message.reply(notValidIDEmbed)
            return
        }
    }
}