const settingsSchema = require("../models/settings-schema");
const ticketSchema = require("../models/ticket-schema");

module.exports = {
  name: "message",
  async execute(message) {
    if (message.channel.type === "dm") return;
    const guildSettings = await settingsSchema.findOne({
      guildId: message.guild.id,
    });

    if (!guildSettings || !guildSettings.settings.transcriptLog) return;
    if (message.channel.parentID !== guildSettings.settings.ticketCategory) return;

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
