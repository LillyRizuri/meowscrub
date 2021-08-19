const Discord = require("discord.js");

const modules = require("../../util/modules");

const globalChatSchema = require("../../models/global-chat-schema");

const badge = require("../../assets/json/badge-emoji.json");
const { red } = require("../../assets/json/colors.json");

module.exports = {
  aliases: [
    "globalchat-notice",
    "globalchat-etiquette",
    "gc-notice",
    "gc-etiquette",
  ],
  memberName: "globalchat-notice",
  group: "misc",
  description: "Read the Global Chat's Notice.",
  cooldown: 5,
  callback: async (client, message) => {
    const botOwner = await client.users.fetch(client.owner[0]);
    let notice = `
+ The Global Chat was built to be fun, but it needs your cooperation to help keeping it fun and cozy for everyone.

+ Since it can connect you to all sorts of different people, try not to say anything insulting, discriminatory, or sexual. You never know who will be on the other side.

+ Global Chat isn’t for advertising, nor for recruiting. People don’t like telemarketers and marketing on real phone calls, and nor do the people using it to communicate with each other!

+ Everyone has feelings, so don’t bully other users who uses this chat out of spite. Doing so can affect, or even ruins their life.

+ Nobody wants to be friends with a person just to get an ad from them, So make sure they’re OK with being friends first if you make new friends within the chat.

+ Don’t even try to be anyone you aren’t. Impersonation can be misleading and confusing. Every badge listed below will be used for identifying members:
⠀• ${badge.newbie} - Newbie
⠀• ${badge.verified} - Verified
⠀• ${badge.staff} - Bot Staff
⠀• ${badge.developer} - Bot Developer
Trying to argue with us for stupid reasons and you will regret it. Impersonating us won't work.

+ There’s always the chance of users using the chat for malicious purposes. If you see those, please contact us staffs immediately.

+ Use your common sense. Decide whether you should do something that may or may not lead you to a punishment. It will help you a lot.
    `;

    const gcInfo = await globalChatSchema.findOne({
      userId: message.author.id,
    });

    if (!gcInfo)
      notice = `${notice}\n+ Lastly, please use the \`${modules.getPrefix(
        message.guild.id
      )}create-profile\` command to join in with other users that are using Global Chat after you've read the entirity of the notice.`;

    const noticeEmbed = new Discord.MessageEmbed()
      .setColor(red)
      .setAuthor(`A notice from ${botOwner.tag}`)
      .setTitle("Global Chat's Notice/Etiquette.")
      .setDescription(notice)
      .setFooter(
        "hope you follow this etiquette, and have a great time using global chat to communicate."
      );

    message.channel.send({ embeds: [noticeEmbed] });
  },
};
