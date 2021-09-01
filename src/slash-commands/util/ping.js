const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong! Check the bot's ping to the Discord server."),
  group: "util",
  callback: async (client, interaction) => {
    await interaction.reply("Attempted to send a ping!");
    const pingMessage = await interaction.channel.send("Ping...");
    return pingMessage.edit(
      `🏓 Pong! The message round-trip took ${
        (pingMessage.editedTimestamp || pingMessage.createdTimestamp) -
        (interaction.editedTimestamp || interaction.createdTimestamp)
      }ms. ${
        client.ws.ping
          ? `The API latency time is around ${Math.round(client.ws.ping)}ms.`
          : ""
      }`
    );
  },
};
