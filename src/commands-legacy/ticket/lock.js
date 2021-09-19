const ticketSchema = require("../../models/ticket-schema");

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["lock"],
  memberName: "lock",
  group: "ticket",
  description: "Lock/Unlock an existing ticket created by me.",
  details:
    "Using this command on a locked ticket will unlock that ticket, and vice versa.\nLeave the parameter blank to let me identify the channel the command was ran in.",
  format: "[#channel | channelID]",
  examples: ["lock #frockles-4339", "lock 866721249640448071"],
  clientPermissions: ["MANAGE_CHANNELS"],
  userPermissions: ["MANAGE_CHANNELS"],
  cooldown: 3,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    let channel;

    if (!args) {
      channel = message.channel;
    } else if (args) {
      channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args);
      if (!channel)
        return message.reply(
          emoji.denyEmoji + " That's NOT a valid Channel ID."
        );
    }

    const results = await ticketSchema.findOne({
      guildId: message.guild.id,
      channelId: channel.id,
    });

    if (!results)
      return message.reply(
        emoji.denyEmoji +
          " The provided channel isn't in the database. What the heck are you doing?"
      );

    const ticketCreator = await client.users.fetch(results.userId);

    if (!results.locked) {
      message.channel.send("Attempting to lock the ticket...");
      await ticketSchema.findOneAndUpdate(
        {
          guildId: message.guild.id,
          channelId: channel.id,
        },
        {
          locked: true,
        }
      );

      await channel.permissionOverwrites.edit(ticketCreator, {
        SEND_MESSAGES: false,
        VIEW_CHANNEL: true,
      });

      await message.reply(
        `<:scrubgreen:797476323316465676> Successfully locked this ticket: ${channel}`
      );
    } else if (results.locked) {
      message.channel.send("Attempting to unlock the ticket...");
      await ticketSchema.findOneAndUpdate(
        {
          guildId: message.guild.id,
          channelId: channel.id,
        },
        {
          locked: false,
        }
      );

      await channel.permissionOverwrites.edit(ticketCreator, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
      });

      await message.reply(
        `<:scrubgreen:797476323316465676> Successfully unlocked this ticket: ${channel}`
      );
    }
  },
};
