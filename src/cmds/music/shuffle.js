const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { red, what, green } = require("../../assets/json/colors.json");

module.exports = class ShuffleMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "shuffle",
      group: "music",
      memberName: "shuffle",
      description: "Shuffle all music from the existing queue.",
      guildOnly: true,
    });
  }

  async run(message) {
    let queue = await this.client.distube.getQueue(message);
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Go to the same VC that I'm blasting music out to shuffle the entire queue."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no queue to even shuffle."
      );

    this.client.distube.shuffle(message);
    const shuffleEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> **Shuffled the entire music queue.**`
      );
    message.channel.send(shuffleEmbed);
  }
};
