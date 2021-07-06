const Commando = require("discord.js-commando");

module.exports = class DiscrimCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "discrim",
      group: "utility",
      memberName: "discrim",
      argsType: "single",
      description:
        "Find people with the same discriminator as you. Make sure they're on a server with me first.",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message, args) {
    let chosenDiscrim = Number(args);

    if (!args) {
      chosenDiscrim = message.author.discriminator;
    } else if (args) {
      if (args.length !== 4 || isNaN(args) || !Number.isInteger(chosenDiscrim))
        return message.reply(
          "<:scrubred:797476323169533963> Your provided discriminator isn't a valid one. Are you trying to confuse me?"
        );
      chosenDiscrim = args;
    }

    const matches = [];
    const users = this.client.users.cache.array();

    for (const user of users) {
      console.log(chosenDiscrim);
      if (user.discriminator === chosenDiscrim) matches.push(`${user.tag}`);
    }

    if (matches.length === 0)
      return message.reply(
        "<:scrubred:797476323169533963> There's no match for that discriminator."
      );

    const reply = `\`\`\`${matches.join("\n")}\`\`\``;

    message.channel.send(reply);
  }
};
