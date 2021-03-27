const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const axios = require("axios");

module.exports = class DocsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: "docs",
            group: "utility",
            memberName: "docs",
            argsType: "single",
            description: "Documentation of discord.js.",
        });
    }

    async run(message, args) {
        const uri = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
      args
    )}`;

        if (!args) {
            const noArgsEmbed = new Discord.MessageEmbed()
                .setColor("#2296F3")
                .setAuthor(
                    "Discord.js Docs (stable)",
                    "https://images-ext-1.discordapp.net/external/5T4uh_keplxixt9k8Rnivq5dMvrLOW2Z11k-OXn-3io/https/discord.js.org/favicon.ico"
                )
                .setTitle(`No search query found.`);
            message.channel.send(noArgsEmbed);
            return;
        }

        axios
            .get(uri)
            .then((embed) => {
                const {
                    data
                } = embed;

                if (data && !data.error) {
                    message.channel.send({
                        embed: data
                    });
                } else {
                    const docsErrorEmbed = new Discord.MessageEmbed()
                        .setColor("#2296F3")
                        .setAuthor(
                            "Discord.js Docs (stable)",
                            "https://images-ext-1.discordapp.net/external/5T4uh_keplxixt9k8Rnivq5dMvrLOW2Z11k-OXn-3io/https/discord.js.org/favicon.ico"
                        )
                        .setTitle(`No documentations found with that name.`);
                    message.channel.send(docsErrorEmbed);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }
};