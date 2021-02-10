const Commando = require('discord.js-commando')
const Discord = require('discord.js')

const { green, what } = require('../../colors.json')

module.exports = class SetNickCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'nickname',
            aliases: ['setnick', 'nick'],
            group: 'moderation',
            memberName: 'nickname',
            description: "Change a member's nickname. Only use it when needed.",
            format: '<@user> <string>',
            examples: ['nick @frockles ManagedNIckname.mp4'],
            argsType: 'multiple',
            clientPermissions: ['MANAGE_NICKNAMES', 'CHANGE_NICKNAME'],
            userPermissions: ['MANAGE_NICKNAMES', 'CHANGE_NICKNAME'],
            guildOnly: true
        })
    }

    run(message, args) {
        const target = message.mentions.users.first()

        if (!target) {
            const noTargetEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> No user has to be found for nickname change.")
                .setFooter("h")
                .setTimestamp()
            message.reply(noTargetEmbed)
            return
        }

        const member = message.guild.members.cache.get(target.id)
        
        args.shift()
        const nickname = args.join(' ')

        if (!nickname) {
            const noNickNameEmbed = new Discord.MessageEmbed()
                .setColor(what)
                .setDescription("<:scrubnull:797476323533783050> Another argument requires a nickname of some sort.")
                .setFooter("try again")
                .setTimestamp()
            message.reply(noNickNameEmbed)
            return
        }

        member.setNickname(nickname)

        const nickchangeEmbed = new Discord.MessageEmbed()
            .setColor(what)
            .setDescription(`<:scrubnull:797476323533783050> Successfully changed <@${target.id}>'s nickname...?`)
            .setFooter("i hope that they aren't abusing unicode characters")
            .setTimestamp()
        message.reply(nickchangeEmbed)





    }
}