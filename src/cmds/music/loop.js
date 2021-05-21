const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const { green } = require("../../assets/json/colors.json");

module.exports = class LoopMusicCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "loop",
      aliases: ["repeat"],
      group: "music",
      memberName: "loop",
      argsType: "single",
      description: "Loop your music or queue.",
      details:
        "There are 3 values to choose: `song`, `queue`, or turn it `off`.",
      format: "<value>",
      examples: ["loop 1"],
      clientPermissions: ["EMBED_LINKS"],
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message, args) {
    const queue = await this.client.distube.getQueue(message);
    let mode = null;
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to loop the music."
      );

    if (!queue)
      return message.reply(
        "<:scrubnull:797476323533783050> Must confirm that there's a queue first."
      );

    if (!args)
      return message.reply(
        "<:scrubnull:797476323533783050> There's no value to set.\nEither it's `queue`, `song`, or turn `off`."
      );

    switch (args) {
      case "off":
        mode = 0;
        break;
      case "song":
        mode = 1;
        break;
      case "queue":
        mode = 2;
        break;
      default:
        return message.reply(
          "<:scrubred:797476323169533963> THAT is not a valid value.\nEither it's `queue`, `song`, or turn `off`."
        );
    }

    mode = this.client.distube.setRepeatMode(message, mode);
    mode = mode ? (mode == 2 ? "Repeat Queue" : "Repeat Song") : "Off";
    const selLoopEmbed = new Discord.MessageEmbed()
      .setColor(green)
      .setDescription(
        `<:scrubgreen:797476323316465676> Set repeat option to: **${mode}**`
      );
    message.channel.send(selLoopEmbed);
  }
};
