const fetch = require("node-fetch");

module.exports = {
  aliases: ["catfact"],
  memberName: "catfact",
  group: "info",
  description: "Share a random fact about cats.",
  cooldown: 5,
  callback: async (client, message) => {
    const json = await fetch("https://some-random-api.ml/facts/cat").then(
      (res) => res.json()
    );
    message.channel.send(json.fact);
  },
};
