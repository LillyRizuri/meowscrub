const settingsSchema = require("../models/settings-schema");
const ticketSchema = require("../models/ticket-schema");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (!message.guild) return;
    const guildSettings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (!guildSettings || !guildSettings.settings.transcriptLog) return;
    if (!guildSettings.settings.ticketChannel || !guildSettings.settings.ticketChannel.channelId) return;

    const ticketProfile = await ticketSchema.findOne({
      guildId: message.guild.id,
      channelId: message.channel.id,
    });

    if (!ticketProfile) return;

    ticketProfile.transcript.push(
      `${message.author.tag} (${message.author.id}):\n${message.content}`
    );

    await ticketProfile.save();
  },
};
