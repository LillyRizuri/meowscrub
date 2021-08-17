module.exports = {
  name: "ready",
  async execute(client) {
    // first presence status before the interval starts
    client.user.setPresence({
      activity: {
        name: "discord.js doing its thing",
        type: "WATCHING",
      },
      status: "idle",
    });

    // changing status for the 10 minutes interval
    setInterval(async () => {
      const status = require("../assets/json/bot-status.json");
      const randomStatus = Math.floor(Math.random() * status.length);

      client.user.setPresence({
        activity: {
          name: status[randomStatus]
            .replace("{servers}", client.guilds.cache.size)
            .replace("{totalStatuses}", status.length),
          type: "WATCHING",
        },
      });
    }, 600000);
  },
};
