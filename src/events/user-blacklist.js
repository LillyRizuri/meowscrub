// const userBlacklistSchema = require("../models/user-blacklist-schema");

// module.exports = {
//   name: "message",
//   async execute(message, client) {
//     const results = await userBlacklistSchema.findOne({
//       userId: message.author.id,
//     });

//     client.dispatcher.addInhibitor((msg) => {
//       if (!results) {
//         return;
//       } else if (results.userId === msg.author.id) {
//         return {
//           reason: "Blacklisted.",
//           response: msg.reply(
//             "You are blacklisted from using my features. For that, you can't do anything other than appeal."
//           ),
//         };
//       }
//     });
//   },
// };
