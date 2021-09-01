module.exports = {
  aliases: ["ping"],
  memberName: "ping",
  group: "util",
  description: "Pong! Check the bot's ping to the Discord server.",
  cooldown: 5,
  callback: async (client, message) => {
    const pingMessage = await message.reply("Ping...");
    return pingMessage.edit(
      `🏓 Pong! The message round-trip took ${
        pingMessage.createdTimestamp - message.createdTimestamp
      }ms. ${
        client.ws.ping
          ? `The API latency time is around ${Math.round(client.ws.ping)}ms.`
          : ""
      }`
    );
  },
};
