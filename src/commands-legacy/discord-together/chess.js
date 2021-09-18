const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["chess"],
  memberName: "chess",
  group: "discord-together",
  description: "Generate an invite to play Chess together!",
  details:
    "The command would generate an invite in the voice channel you're in.",
  cooldown: 5,
  guildOnly: true,
  callback: async (client, message) => {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.reply(
        emoji.missingEmoji +
          "Join an appropriate voice channel to use this command."
      );

    const together = await client.discordTogether.createTogetherCode(
      message.member.voice.channelId,
      "chess"
    );

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setStyle("LINK")
        .setURL(together.code)
        .setLabel("Initiate the activity: Chess In The Park")
    );

    await message.reply({
      content:
        "Click on the button to start the activity. ONLY APPLICABLE FOR DESKTOP USERS!",
      components: [row],
    });
  },
};
