const Commando = require('discord.js-commando')
const Discord = require('discord.js')
const fetch = require('node-fetch')

const { red, embedcolor } = require('../../colors.json')

module.exports = class PokeDexCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'pokedex',
            aliases: ['pokemon', 'pkmn'],
            group: 'conventional',
            memberName: 'pokedex',
            description: 'Search for a Pokémon.',
            argsType: 'single'
        })
    }

    run(message, args) {
        const pokemon = args

        if (!pokemon) {
            const noArgsEmbed = new Discord.MessageEmbed()
                .setColor(red)
                .setDescription('<:scrubred:797476323169533963> Provide a specific Pokémon in order to continue')
                .setFooter('otherwise no data for you')
                .setTimestamp()
            message.reply(noArgsEmbed)
            return
        }
           

        fetch(`https://some-random-api.ml/pokedex?pokemon=${pokemon}`)
            .then(res => res.json())
            .then(json => {
                try {
                    const embed = new Discord.MessageEmbed()
                    .setColor(embedcolor)
                    .setThumbnail(json.sprites.animated)
                    .setAuthor(`Pokédex for ID: ${json.id} | ${(json.name).toProperCase()}`)
                    .addFields({
                        name: 'Species',
                        value: json.species,
                        inline: true
                    }, {
                        name: 'Type',
                        value: json.type,
                        inline: true
                    }, {
                        name: 'Height',
                        value: json.height,
                        inline: true
                    }, {
                        name: 'Weight',
                        value: json.weight,
                        inline: true
                    }, {
                        name: 'Gender Rate',
                        value: json.gender,
                        inline: true
                    }, {
                        name: 'Abilities',
                        value: json.abilities,
                        inline: true
                    }, {
                        name: 'Pokémon Description',
                        value: json.description
                    })
                    .setFooter('Results Provide by Some Random Api')
                    .setTimestamp()
                message.channel.send(embed)
            } catch (err) {
                const noResultsEmbed = new Discord.MessageEmbed()
                        .setColor(red)
                        .setDescription(`<:scrubred:797476323169533963> No results for: **${pokemon}**.`)
                        .setFooter("does it exists in any pokémon game?")
                        .setTimestamp()
                    message.reply(noResultsEmbed)
                    return
            }
            })
    }
}