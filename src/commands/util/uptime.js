module.exports = {
  aliases: ["uptime"],
  memberName: "uptime",
  group: "util",
  description: "Shows the client's consistent uptime.",
  callback: async (client, message) => {
    let totalSeconds = client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    message.channel.send(`
\`\`\`css\n${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec\`\`\`
    `);
  },
};
