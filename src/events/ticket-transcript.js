const settingsSchema = require("../models/settings-schema");
const ticketSchema = require("../models/ticket-schema");

module.exports = {
  name: "message",
  async execute(message) {
    const guildSettings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (!guildSettings.transcriptLog) return;
    if (message.channel.parentID !== guildSettings.ticketCategory) return;

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
