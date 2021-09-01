const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Shows the client's consistent uptime."),
  group: "util",
  callback: async (client, interaction) => {
    let totalSeconds = client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    interaction.reply(`
\`\`\`css\n${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec\`\`\`
    `);
  },
};
