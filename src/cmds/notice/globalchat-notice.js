const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { red } = require("../../assets/json/colors.json");

module.exports = class GlobalChatNoticeCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "globalchat-notice",
      aliases: ["globalchat-etiquette", "gc-notice", "gc-etiquette"],
      group: "notice",
      memberName: "globalchat-notice",
      description: "Global Chat's Notice/Etiquette.",
      details:
        "Distribute this to everyone who just started participating in Global Chat.",
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  async run(message) {
    const botOwner = await this.client.users.fetch(process.env.OWNERID);
    const noticeEmbed = new Discord.MessageEmbed()
      .setColor(red)
      .setAuthor(`A notice from ${botOwner.tag}`)
      .setTitle("Global Chat's Notice/Etiquette.")
      .setDescription(
        `
• The Global Chat was built to be fun, but it needs your cooperation to help keeping it fun and cozy for everyone.

• Since it can connect you to all sorts of different people, try not to say anything insulting, discriminatory, or sexual. You never know who will be on the other side.

• Global Chat isn’t for advertising, nor for recruiting. People don’t like telemarketers and marketing on real phone calls, and nor do the people using it to communicate with each other!

• Everyone has feelings, so don’t bully other users who uses this chat out of spite. Doing so can affect, or even ruins their life.

• Nobody wants to be friends with a person just to get an ad from them, So make sure they’re OK with being friends first if you make new friends within the chat.

• Don’t even try to be anyone you aren’t. Impersonation can be misleading and confusing. Staffs responsible for the bot do use the chat, and they will have this badge appended to them: 👮‍♂️. Trying to argue with us for stupid reasons and you will regret it. Impersonating us won't work.

• There’s always the chance of users using the phones for malicious purposes. Report an excerpt of the conversation in Global Chat by going to our server, and we will check the that excerpt to see suspicious activities.

• Lastly, use your common sense. Decide whether you should do something that may or may not lead you to a punishment. It will help you a lot.
      `
      )
      .setFooter(
        "hope you follow this etiquette, and have a great time using global chat to communicate."
      );
    message.channel.send(noticeEmbed);
  }
};
