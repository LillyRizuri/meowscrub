const Commando = require("discord.js-commando");
const disbut = require("discord-buttons");

module.exports = class TogetherCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "chess",
      group: "discord-together",
      memberName: "chess",
      description: "Generate an invite to play Chess together!",
      details:
        "The command would generate an invite in the voice channel you're in.",
      throttling: {
        usages: 1,
        duration: 5,
      },
      guildOnly: true,
    });
  }

  async run(message) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        "<:scrubnull:797476323533783050> Join an appropriate voice channel to use this command."
      );

    const together = await this.client.discordTogether.createTogetherCode(
      message.member.voice.channelID,
      "chess"
    );

    const togetherCode = new disbut.MessageButton()
      .setStyle("url")
      .setURL(together.code)
      .setLabel("Initiate the activity: CG 2 Dev (Chess)");

    await message.reply(
      "Click on the button to start the activity. ONLY APPLICABLE FOR DESKTOP USERS!",
      togetherCode
    );
  }
};
