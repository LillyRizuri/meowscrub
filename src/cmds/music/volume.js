const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { what, red, green } = require("../../assets/json/colors.json");

module.exports = class AdjustVolume extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "volume",
      aliases: ["vol", "v"],
      group: "music",
      memberName: "volume",
      argsType: "single",
      description: "Adjust the volume of the music player (in %)",
      format: "<number>",
      examples: ["volume 80"],
    });
  }

  async run(message, args) {
    const queue = this.client.distube.getQueue(message);
    if (!queue) {
      const noMusicEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> There's no queue. Have at least one song before advancing."
        )
        .setFooter("c'mon")
        .setTimestamp();
      return message.reply(noMusicEmbed);
    }

    const volume = Number(args);
    if (isNaN(volume) || !Number.isInteger(volume)) {
      const invalidEmbed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          `<:scrubred:797476323169533963> Percentage not valid. Try again.`
        )
        .setFooter("bus")
        .setTimestamp();
      message.reply(invalidEmbed);
      return;
    }

    if (volume < 1 || volume > 200) {
      const invalid2Embed = new Discord.MessageEmbed()
        .setColor(red)
        .setDescription(
          `<:scrubred:797476323169533963> The percentage you provided must be in-between 1% and 200%`
        )
        .setFooter("making eardrum explode isn't a good idea")
        .setTimestamp();
      message.reply(invalid2Embed);
      return;
    }

    this.client.distube.setVolume(message, volume);
    const volEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Adjusted the volume to **${volume}%**.`
      );
    message.channel.send(volEmbed);
  }
};
