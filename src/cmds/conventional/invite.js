const Commando = require("discord.js-commando");
const Discord = require("discord.js");

module.exports = class InviteBotCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "invite",
      group: "conventional",
      memberName: "invite",
      description: "Invite link for me to join your server.",
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
    });
  }

  run(message) {
    const inviteEmbed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(
        `**Generated an invite link! It** [lies here.](https://discord.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=473295958)`
      );
    message.channel.send(inviteEmbed);
  }
};
