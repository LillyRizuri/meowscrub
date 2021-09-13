module.exports = {
  name: "ready",
  async execute(client) {
    // first presence status before the interval starts
    // client.user.setPresence({
    //   activities: [
    //     {
    //       name: `discord.js doing its thing | @${client.user.username} help`,
    //       type: "WATCHING",
    //     },
    //   ],
    //   status: "idle",
    // });

    client.user.setPresence({
      activities: [
        {
          name: `me waiting for verification | @${client.user.username} help`,
          type: "WATCHING",
        },
      ],
      status: "idle",
    });

    // changing status for the 5 minutes interval
    // setInterval(async () => {
    //   const status = require("../assets/json/bot-status.json");
    //   const randomStatus = status[Math.floor(Math.random() * status.length)];

    //   client.user.setPresence({
    //     activities: [
    //       {
    //         name: randomStatus
    //           .replace("{servers}", client.guilds.cache.size)
    //           .replace("{totalStatuses}", status.length) + ` | @${client.user.username} help`,
    //         type: "WATCHING",
    //       },
    //     ],
    //   });
    // }, 300000);
  },
};
