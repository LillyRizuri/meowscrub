const Commando = require("discord.js-commando");

module.exports = class BotUptimeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "uptime",
      group: "utility",
      memberName: "uptime",
      description: "Shows how long I am awake.",
    });
  }

  run(message) {
    let totalSeconds = this.client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    message.channel.send(`
My current uptime:
\`\`\`css\n${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec\`\`\`
    `);
  }
};
