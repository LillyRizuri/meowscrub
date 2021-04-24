module.exports = {
  async execute(client) {
    // Check if the user is blacklisted based on the user-blacklist.json file
    client.dispatcher.addInhibitor((msg) => {
      const userBlacklist = require("../../user-blacklist.json");
      if (userBlacklist.indexOf(msg.author.id) !== -1)
        return {
          reason: "Blacklisted.",
          response: msg.reply(
            "You are blacklisted from using my features. For that, you can't do anything other than appeal."
          ),
        };
    });
  },
};
