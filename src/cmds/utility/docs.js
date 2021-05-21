const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fetch = require("node-fetch");
const utf8 = require("utf8");

module.exports = class DocsCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "docs",
      group: "utility",
      memberName: "docs",
      argsType: "single",
      description: "Documentation of discord.js.",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
    const uri = utf8.encode(
      `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
        args
      )}`
    );

    if (!args) {
      const noArgsEmbed = new Discord.MessageEmbed()
        .setColor("#2296F3")
        .setAuthor(
          "Discord.js Docs (stable)",
          "https://images-ext-1.discordapp.net/external/5T4uh_keplxixt9k8Rnivq5dMvrLOW2Z11k-OXn-3io/https/discord.js.org/favicon.ico"
        )
        .setTitle("There is no search query.");
      message.channel.send(noArgsEmbed);
      return;
    }

    fetch(uri)
      .then((res) => res.json())
      .then((json) => {
        if (json && !json.error) {
          message.channel.send({
            embed: json,
          });
        } else {
          const docsErrorEmbed = new Discord.MessageEmbed()
            .setColor("#2296F3")
            .setAuthor(
              "Discord.js Docs (stable)",
              "https://images-ext-1.discordapp.net/external/5T4uh_keplxixt9k8Rnivq5dMvrLOW2Z11k-OXn-3io/https/discord.js.org/favicon.ico"
            )
            .setTitle("No documentations found with that name.");
          message.channel.send(docsErrorEmbed);
        }
      });
  }
};
