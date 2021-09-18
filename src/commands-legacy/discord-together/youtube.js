const Discord = require("discord.js");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["youtube"],
  memberName: "youtube",
  group: "discord-together",
  description: "Generate an invite to watch YouTube videos together!",
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
      "youtube"
    );

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setStyle("LINK")
        .setURL(together.code)
        .setLabel("Initiate the activity: YouTube Together")
    );

    await message.reply({
      content:
        "Click on the button to start the activity. ONLY APPLICABLE FOR DESKTOP USERS!",
      components: [row],
    });
  },
};
