const Discord = require("discord.js");
const humanizeDuration = require("humanize-duration");
const settingsSchema = require("../models/settings-schema");
const userBlacklistSchema = require("../models/user-blacklist-schema");
const botStaffSchema = require("../models/bot-staff-schema");

const gcCooldowns = new Map();

module.exports = {
  name: "message",
  async execute(message, client) {
    try {
      let guildChannelId;
      let otherGuildChannelId;

      const currentGuildResults = await settingsSchema.find({
        guildId: message.guild.id,
      });

      for (let i = 0; i < currentGuildResults.length; i++) {
        const { globalChat } = currentGuildResults[i];
        guildChannelId = globalChat;
      }

      const thisChannel = message.guild.channels.cache.get(guildChannelId);
      try {
        // If the target is blacklisted, return
        if (guildChannelId.includes(message.channel.id)) {
          const results = await userBlacklistSchema.findOne({
            userId: message.author.id,
          });

          if (results) {
            await message.delete();
            const msg = await thisChannel.send(
              `**${message.author.tag}**, You are blacklisted from using this functionality. For that, your message won't be delivered.`
            );

            setTimeout(() => {
              msg.delete();
            }, 5000);
            return;
          }

          // if the target is in cooldown, return
          const cooldown = gcCooldowns.get(message.author.id);
          if (cooldown) {
            const remaining = humanizeDuration(cooldown - Date.now(), {
              round: true,
            });
            await message.delete();
            const msg = await thisChannel.send(
              `**${message.author.tag}**, You are in cooldown for ${remaining}.`
            );

            setTimeout(() => {
              msg.delete();
            }, 5000);
            return;
          }

          // if the target's message is over 1024 characters, return
          if (message.content.length > 1024) {
            await message.delete();
            const msg = await thisChannel.send(
              `**${message.author.tag}**, Your message musn't be more than 1024 characters.`
            );

            setTimeout(() => {
              msg.delete();
            }, 5000);
            return;
          }
        }
        // eslint-disable-next-line no-empty
      } catch (err) {}

      // check if the message was sent in a global chat channel, and if the target wasn't a bot
      if (message.channel.id === guildChannelId && !message.author.bot) {
        // check if the target is a bot staff
        const isBotStaff = await botStaffSchema.findOne({
          userId: message.author.id,
        });

        // check if the target is a bot owner/staff
        // if the target isn't, set up a cooldown for 3 seconds.
        // eslint-disable-next-line no-empty
        if (client.isOwner(message.author) || isBotStaff) {
        } else {
          gcCooldowns.set(message.author.id, Date.now() + 3000);
          setTimeout(() => {
            gcCooldowns.delete(message.author.id);
          }, 3000);
        }

        // for each guilds that the client was in
        client.guilds.cache.forEach(async (guild) => {
          // if the guild that the client chose happens to be the same guild the message was sent in, return
          if (guild === message.guild) return;

          // fetch to see if the guild that the client chose have a global chat channel
          const otherGuildResults = await settingsSchema.find({
            guildId: guild.id,
          });

          for (let i = 0; i < otherGuildResults.length; i++) {
            const { globalChat } = otherGuildResults[i];
            otherGuildChannelId = globalChat;
          }

          const channel = guild.channels.cache.get(otherGuildChannelId);

          // if there's none, return
          if (!channel) return;

          // get message attachments
          const attachment = message.attachments.first()
            ? message.attachments.first().proxyURL
            : null;

          let usernamePart;

          // check the guild is/isn't a guild test
          if (!process.env.GUILD_TEST || guild.id !== process.env.GUILD_TEST) {
            // if the target is a bot owner/bot staff, have a police emoji append with their username
            if (client.isOwner(message.author) || isBotStaff) {
              usernamePart = `👮‍♂️ **\`${message.author.tag}\` - \`${message.guild.name}\`**`;
            } else {
              usernamePart = `👤 **\`${message.author.tag}\` - \`${message.guild.name}\`**`;
            }
          } else if (guild.id === process.env.GUILD_TEST) {
            // same with above, but add the user id and the guild id if the guild chosen was a guild test
            if (client.isOwner(message.author) || isBotStaff) {
              usernamePart = `
👮‍♂️ **\`${message.author.tag}\` - \`${message.guild.name}\`**
**userID: \`${message.author.id}\` - guildID: \`${message.guild.id}\`**`;
            } else {
              usernamePart = `
👤 **\`${message.author.tag}\` - \`${message.guild.name}\`**
**userID: \`${message.author.id}\` - guildID: \`${message.guild.id}\`**`;
            }
          }

          // transform all user mentions in message content to usernames and tags
          let modifiedMessageContent;
          message.mentions.users.each(async (user) => {
            modifiedMessageContent = message.content
              .split(`<@!${user.id}>`)
              .join(`@${user.tag}`);

            // check if nothing has changed
            if (modifiedMessageContent === message.content)
              modifiedMessageContent = message.content
                .split(`<@${user.id}>`)
                .join(`@${user.tag}`);

            message.content = modifiedMessageContent;
          });

          // check if the message contains any attachments
          if (!attachment) {
            await channel
              .send(`${usernamePart}\n${message.content}`)
              .catch((err) => {
                message.channel.send(
                  `Can't deliver the message to **${guild}** for: ${err}`
                );
              });
          } else if (attachment) {
            const attachmentToSend = new Discord.MessageAttachment(attachment);
            await channel
              .send(
                message.content
                  ? `${usernamePart}\n${message.content}`
                  : `${usernamePart}`,
                attachmentToSend
              )
              .catch((err) => {
                try {
                  // try to send a notice if the bot can't send attachment to the guild chosen
                  const errorMessage = `*Error sending attachment: ${err}*`;
                  channel.send(
                    message.content
                      ? `${usernamePart}\n${message.content}\n${errorMessage}`
                      : `${usernamePart}\n${errorMessage}`
                  );
                } catch (err) {
                  message.channel.send(
                    `Can't deliver the message to **${guild}** for: ${err}`
                  );
                }
              });
          }
        });
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
