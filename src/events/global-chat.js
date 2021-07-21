const Discord = require("discord.js");
const humanizeDuration = require("humanize-duration");
const modules = require("../modules");
const settingsSchema = require("../models/settings-schema");
const globalChatSchema = require("../models/global-chat-schema");
const userBlacklistSchema = require("../models/user-blacklist-schema");
const botStaffSchema = require("../models/bot-staff-schema");

const gcCooldowns = new Map();
const sameUserLog = new Map();

const badge = require("../assets/json/badge-emoji.json");
const { red } = require("../assets/json/colors.json");

module.exports = {
  name: "message",
  async execute(message, client) {
    if (message.channel.type === "dm") return;
    const botOwner = await client.users.fetch(process.env.OWNERID);
    const requiredMsgForVerification = 100;
    try {
      const currentGuildResults = await settingsSchema.findOne({
        guildId: message.guild.id,
      });

      if (!currentGuildResults) return;
      if (!currentGuildResults.globalChat) return;

      const thisChannel = message.guild.channels.cache.get(
        currentGuildResults.globalChat
      );

      if (!thisChannel) return;

      // check if the message was sent in a global chat channel, and if the target wasn't a bot
      if (
        message.channel.id === currentGuildResults.globalChat &&
        !message.author.bot
      ) {
        const channelPermissions = message.channel.permissionsFor(
          message.client.user
        );

        const canSendMessages = channelPermissions.has("SEND_MESSAGES");
        const canSendEmbed = channelPermissions.has("EMBED_LINKS");
        const canViewChannel = channelPermissions.has("VIEW_CHANNEL");
        const canReadMsgHistory = channelPermissions.has(
          "READ_MESSAGE_HISTORY"
        );

        if (
          canSendMessages &&
          canSendEmbed &&
          canViewChannel &&
          canReadMsgHistory
          // eslint-disable-next-line no-empty
        ) {
        } else {
          return message.reply(
            "<:scrubred:797476323169533963> It seems like I somehow can't manage the ticket channel's category properly. Please contact your nearest server manager to give me these permissions:\n`Send Messages, Embed Links, View Channel, Read Message History`"
          );
        }
        // await message.delete();
        // const msg = await message.reply(
        //   `The chat is closed due to a potential raider. For more information, please get in touch wtih **${botOwner.tag}**.`
        // );

        // setTimeout(() => {
        //   msg.delete();
        // }, 5000);
        // return;
        // If the target is blacklisted, return
        const results = await userBlacklistSchema.findOne({
          userId: message.author.id,
        });

        if (results) {
          await message.delete();
          const msg = await message.channel.send(
            `**${message.author.tag}**, You are blacklisted from using this functionality. For that, your message won't be delivered.`
          );

          setTimeout(() => {
            msg.delete();
          }, 5000);
          return;
        }

        // find global chat data for an user
        let gcInfo = await globalChatSchema.findOne({
          userId: message.author.id,
        });

        // if there isn't one, do not advance any further into the code
        if (!gcInfo) {
          await message.delete();
          const holdUpEmbed = new Discord.MessageEmbed()
            .setColor(red)
            .setTitle("Hold Up!")
            .setDescription(
              `
If you receive this messaage while trying to use Global Chat, you probably haven't read through Global Chat's Notice yet.
Please do so by using the \`${client.commandPrefix}globalchat-notice\` command, then you may proceed through the next step provided by the command.
`
            )
            .setFooter(`Please contact ${botOwner.tag} if you're confused.`);

          const msg = await message.reply(holdUpEmbed);

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

        // check if the target is a bot staff
        const isBotStaff = await botStaffSchema.findOne({
          userId: message.author.id,
        });

        // urlify the message content so that the bot can see the difference
        // if the bot sees 1 or more differences, it will think that a newbie sent 1 or more links
        // eslint-disable-next-line no-empty
        if (client.isOwner(message.author) || isBotStaff) {
        } else if (gcInfo.messageCount < requiredMsgForVerification) {
          const urlify = modules.urlify(message.content);
          if (urlify !== message.content) {
            await message.delete();
            const msg = await thisChannel.send(
              `**${message.author.tag}**, Links are not allowed for new members using this chat.`
            );

            setTimeout(() => {
              msg.delete();
            }, 5000);
            return;
          }
        }

        // if the target is in cooldown, return
        const cooldown = gcCooldowns.get(message.author.id);
        if (cooldown) {
          const remaining = humanizeDuration(cooldown - Date.now());
          await message.delete();
          const msg = await thisChannel.send(
            `**${message.author.tag}**, You are in cooldown for ${remaining}.`
          );

          setTimeout(() => {
            msg.delete();
          }, 5000);
          return;
        }

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

        // update the message count
        await globalChatSchema.findOneAndUpdate(
          {
            userId: message.author.id,
          },
          {
            userId: message.author.id,
            messageCount: gcInfo.messageCount + 1,
          },
          {
            upsert: true,
          }
        );

        gcInfo = await globalChatSchema.findOne({
          userId: message.author.id,
        });

        // transform all user mentions in message content to usernames and tags
        let modifiedMessageContent;
        if (message.mentions.users.first()) {
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
        }

        // get the first message attachment
        const attachment = message.attachments.first();

        // depends on account status, have a designated badge append with their username
        let badgeDisplayed = "";
        if (client.isOwner(message.author)) {
          badgeDisplayed = badge.developer;
        } else if (isBotStaff) {
          badgeDisplayed = badge.staff;
        } else if (gcInfo.messageCount < requiredMsgForVerification) {
          badgeDisplayed = badge.newbie;
        } else {
          badgeDisplayed = badge.verified;
        }

        const sameUserOld = new Map(sameUserLog);

        sameUserLog.clear();
        sameUserLog.set(message.author.id, message.guild.id);

        await message.delete();

        // for each guilds that the client was in
        client.guilds.cache.forEach(async (guild) => {
          // fetch to see if the guild that the client chose have a global chat channel
          const otherGuildResults = await settingsSchema.findOne({
            guildId: guild.id,
          });

          if (!otherGuildResults) return;
          if (!otherGuildResults.globalChat) return;

          const channel = guild.channels.cache.get(
            otherGuildResults.globalChat
          );

          // if there's none, return
          if (!channel) return;

          let usernamePart = "";

          // check the guild is/isn't a guild test
          if (!modules.compareMaps(sameUserLog, sameUserOld)) {
            if (
              !process.env.GUILD_TEST ||
              guild.id !== process.env.GUILD_TEST
            ) {
              usernamePart = `_ _\n[ ${badgeDisplayed} **\`${message.author.tag}\` - \`${message.guild.name}\`** ]`;
            } else if (guild.id === process.env.GUILD_TEST) {
              usernamePart = `
_ _\n[ ${badgeDisplayed} **\`${message.author.tag}\` - \`${message.guild.name}\`** ]
**userID: \`${message.author.id}\` - guildID: \`${message.guild.id}\`**`;
            }
          } else if (modules.compareMaps(sameUserLog, sameUserOld)) {
            usernamePart = "";
          }

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
            // eslint-disable-next-line no-empty
            if (client.isOwner(message.author) || isBotStaff) {
            } else if (gcInfo.messageCount < requiredMsgForVerification) {
              const prohibitedMsg =
                "*Can't send attachments due to the status of being a newbie.*";
              await channel.send(
                message.content
                  ? `${usernamePart}\n${message.content}\n${prohibitedMsg}`
                  : `${usernamePart}\n${prohibitedMsg}`
              );
              return;
            }

            if (!attachment.height || !attachment.width) {
              const prohibitedAttachmentNotice =
                "*The user attempted to send something other than image and video.*";
              await channel
                .send(
                  message.content
                    ? `${usernamePart}\n${message.content}\n${prohibitedAttachmentNotice}`
                    : `${usernamePart}\n${prohibitedAttachmentNotice}`
                )
                .catch((err) => {
                  message.channel.send(
                    `Can't deliver the message to **${guild}** for: ${err}`
                  );
                });
            } else {
              await channel
                .send(
                  message.content
                    ? `${usernamePart}\n${message.content}`
                    : `${usernamePart}`,
                  attachment
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
          }
        });
      }

      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
