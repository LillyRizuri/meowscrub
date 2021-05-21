const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");

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
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message, args) {
    const queue = this.client.distube.getQueue(message);
    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no queue. Have at least one song before advancing."
      );

    const volume = Number(args);
    if (isNaN(volume) || !Number.isInteger(volume))
    return message.reply(
      "<:scrubred:797476323169533963> Percentage not valid. Try again."
    );

    if (volume < 1 || volume > 200)
    return message.reply(
      "<:scrubred:797476323169533963> The percentage you provided must be in-between 1 - 200%.\nMaking everyone's eardrum explode isn't a good idea."
    );

    this.client.distube.setVolume(message, volume);
    const volEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Adjusted the volume to **${volume}%**.`
      );
    message.channel.send(volEmbed);
  }
};
