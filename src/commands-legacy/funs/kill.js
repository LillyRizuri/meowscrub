const emoji = require("../../assets/json/tick-emoji.json");
const killResponse = require("../../assets/json/kill-response.json");

module.exports = {
  aliases: ["kill"],
  memberName: "kill",
  group: "funs",
  description: "Sick of someone? Kill that person.",
  details: "We don't endorse murder in any shape or form, remember that.",
  format: "<@user>",
  examples: ["kill @frockles#4339"],
  cooldown: 5,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message) => {
    const target = message.mentions.users.first();

    if (!target)
      return message.reply(
        emoji.missingEmoji + " Do it again, but this time actually mention someone to kill."
      );

    switch (target) {
      case message.author:
        return message.reply(
          emoji.denyEmoji + " Okay you're dead. Pick someone else to kill for real."
        );
      case client.user:
        return message.reply(
          emoji.denyEmoji + " No. You can't just kill me like that."
        );
    }

    const randomKillResponse =
      killResponse[Math.floor(Math.random() * killResponse.length)];

    message.channel.send(
      randomKillResponse
        .split("{target}")
        .join(target.username)
        .split("{author}")
        .join(message.author.username)
    );
  },
};
