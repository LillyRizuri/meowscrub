module.exports = {
  aliases: ["tryitandsee", "tias"],
  memberName: "tryitandsee",
  group: "misc",
  description: "Try it and see.",
  clientPermissions: ["EMBED_LINKS"],
  cooldown: 3,
  callback: async (client, message) => {
    message.channel.send("https://tryitands.ee/");
  },
};
