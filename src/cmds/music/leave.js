const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");

module.exports = class StopMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "leave",
      aliases: ["dis", "disconnect", "fuckoff"],
      group: "music",
      memberName: "leave",
      description: "Stop playing music for you.",
      guildOnly: true,
    });
  }

  async run(message) {
    const queue = await this.client.distube.getQueue(message);

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to stop me"
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no music to play."
      );

    this.client.distube.stop(message);
    const stoppedEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        "<:scrubgreen:797476323316465676> **Stopped the track, and cleaned the queue.**"
      );
    message.channel.send(stoppedEmbed);
  }
};
