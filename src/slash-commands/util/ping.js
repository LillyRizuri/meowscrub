const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pong! Check the bot's ping to the Discord server."),
  group: "util",
  callback: async (client, interaction) => {
    const pingMessage = await interaction.reply({
      content: "Ping...",
      fetchReply: true,
    });

    return interaction.editReply(
      `🏓 Pong! The message round-trip took ${
        pingMessage.createdTimestamp - interaction.createdTimestamp
      }ms. ${
        client.ws.ping
          ? `The API latency time is around ${Math.round(client.ws.ping)}ms.`
          : ""
      }`
    );
  },
};
