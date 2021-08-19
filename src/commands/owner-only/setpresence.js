const status = require("../../assets/json/bot-status.json");
const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["setpresence"],
  memberName: "setpresence",
  group: "owner-only",
  description: "Set my presence based on your provided argument.",
  details: "Only the bot owner(s) may use this command.",
  format: "<string>",
  examples: ["setpresence mmmmmmmmm"],
  singleArgs: true,
  ownerOnly: true,
  hidden: true,
  callback: async (client, message, args) => {
    let pickedPresence = "";
    if (!args)
      pickedPresence = status[Math.floor(Math.random() * status.length)];
    else pickedPresence = args;

    try {
      client.user.setPresence({
        activities: [
          {
            name: pickedPresence,
            type: "WATCHING",
          },
        ],
        status: "idle",
      });
      message.reply(
        emoji.successEmoji +
          `Successfully changed my presence to: \`${pickedPresence}\``
      );
    } catch (err) {
      message.reply(`An unexpected error occured.\n${err}`);
    }
  },
};
