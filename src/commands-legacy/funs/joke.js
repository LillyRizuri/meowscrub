const fetch = require("node-fetch");

module.exports = {
  aliases: ["joke"],
  memberName: "joke",
  group: "funs",
  description: "Tell jokes!",
  cooldown: 5,
  callback: async (client, message) => {
    const result = await fetch(
      "https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit"
    ).then((res) => res.json());

    if (!result.setup && !result.delivery) message.channel.send(result.joke);
    else message.channel.send(`${result.setup}\n||${result.delivery}||`);
  },
};
