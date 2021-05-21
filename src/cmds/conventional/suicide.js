const Commando = require("discord.js-commando");
const Discord = require("discord.js");

module.exports = class SuicideHotlineCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "suicide",
      aliases: ["suicidehotline", "selfharm"],
      group: "conventional",
      memberName: "suicide",
      description: "Use this command to not kill yourself, fortunately.",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message) {
    const suicideHotlineEmbed = new Discord.MessageEmbed()
      .setColor("#ff0000")
      .setAuthor("Suicide and Self-Harm Prevention")
      .setTitle("We want you to know that you, are not, and never alone.")
      .setThumbnail("https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif")
      .setDescription(
        `
**__Suicide/Self-Harm Immediate 24/7 Hotlines:__**
+ [USA Suicide Hotline](https://suicidepreventionlifeline.org): 1-800-273-8225
+ [International Suicide Hotlines](https://www.opencounseling.com/suicide-hotlines): These hotlines are made available to those that don't reside in the United States currently. Look up the number on the list that correlates to your residency and call it. It will connect you to your country's suicide hotline.
`
      )
      .setFooter("suicide is bad, and always will be.");
    message.channel.send(suicideHotlineEmbed);
  }
};
