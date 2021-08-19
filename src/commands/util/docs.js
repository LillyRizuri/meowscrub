const fetch = require("node-fetch");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["docs", "djs", "discordjs"],
  memberName: "docs",
  group: "util",
  description: "View documentations for Discord.JS.",
  format: "<searchString>",
  examples: ["docs Message"],
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 5,
  singleArgs: true,
  callback: async (client, message, args) => {
    const uri = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(
      args
    )}`;

    if (!args)
      return message.reply(
        emoji.missingEmoji +
          " You must provide a serach query in order to continue."
      );

    const result = await fetch(uri).then((res) => res.json());

    if (result && !result.error) {
      message.channel.send({ embeds: [result] });
    } else {
      return message.reply(
        emoji.denyEmoji +
          "There's no documentations found with that search query."
      );
    }
  },
};
