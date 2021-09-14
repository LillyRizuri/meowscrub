const humanizeDuration = require("humanize-duration"),
  util = require("../util/util"),
  settingsSchema = require("../models/settings-schema"),
  globalChatSchema = require("../models/global-chat-schema"),
  userBlacklistSchema = require("../models/user-blacklist-schema"),
  botStaffSchema = require("../models/bot-staff-schema");

const gcCooldowns = new Map();

const emoji = require("../assets/json/tick-emoji.json"),
  badge = require("../assets/json/badge-emoji.json"),
  referralDomains = require("../assets/json/referral-domains.json"),
  safeDomains = require("../assets/json/safe-domains.json"),
  profanities = require("../assets/json/profanities.json"),
  whitelistedWords = require("../assets/json/whitelisted-words.json");

let userLogCopy = "",
  userLog = "",
  currentGCChannel = "",
  timeout;

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message.guild) return;
    const botOwner = await client.users.fetch(client.owner[0]);
    const msgCountForApproval = 100;

    function initTimeout() {
      timeout = setTimeout(() => {
        userLog = "";
        timeout = null;
      }, 420000);
    }

    try {
      if (client.cache.globalChat[message.guild.id]) {
        currentGCChannel = client.cache.globalChat[message.guild.id];
      } else if (!client.cache.globalChat[message.guild.id]) {
        const msgGuildRes = await settingsSchema.findOne({
          guildId: message.guild.id,
        });

        if (!msgGuildRes || !msgGuildRes.settings.globalChat) return;

        client.cache.globalChat[message.guild.id] =
          msgGuildRes.settings.globalChat;

        currentGCChannel = client.cache.globalChat[message.guild.id];
      }

      const thisChannel = message.guild.channels.cache.get(currentGCChannel);

      if (!thisChannel) return;

      // check if the message was sent in a global chat channel, and if the target wasn't a bot
      if (
        message.channel.id === currentGCChannel &&
        !message.author.bot
        // eslint-disable-next-line no-empty
      ) {
      } else return;

      const channelPermissions = message.channel.permissionsFor(
        message.client.user
      );

      const canSendMessages = channelPermissions.has("SEND_MESSAGES");
      const canSendEmbed = channelPermissions.has("EMBED_LINKS");
      const canViewChannel = channelPermissions.has("VIEW_CHANNEL");
      const canReadMsgHistory = channelPermissions.has("READ_MESSAGE_HISTORY");
      const canManageMessages = channelPermissions.has("MANAGE_MESSAGES");

      if (
        canSendMessages &&
        canSendEmbed &&
        canViewChannel &&
        canReadMsgHistory &&
        canManageMessages
        // eslint-disable-next-line no-empty
      ) {
      } else {
        return message.reply(
          emoji.denyEmoji +
            " It seems like I somehow can't accerss this global chat channel properly. Please contact your nearest server manager to give me these permissions:\n`Send Messages, Embed Links, View Channel, Read Message History`"
        );
      }

      await message.delete();

      // const msg = await message.reply(
      //   `The chat is closed due to a potential raider. For more information, please get in touch wtih **${botOwner.tag}**.`
      // );
      // return setTimeout(() => msg.delete(), 5000);

      // If the target is blacklisted, return
      const results = await userBlacklistSchema.findOne({
        userId: message.author.id,
      });

      if (results) {
        const msg = await message.channel.send(
          `**${message.author.toString()}**, You are blacklisted from using this functionality. For that, your message won't be delivered.`
        );

        return setTimeout(() => msg.delete(), 5000);
      }

      // find global chat data for an user
      let gcInfo = await globalChatSchema.findOne({
        userId: message.author.id,
      });

      // if there isn't one, do not advance any further into the code
      if (!gcInfo) {
        const msg = await message.channel.send(`
${message.author.toString()}, **Hold Up!**
If you receive this messaage while trying to use Global Chat, you probably haven't read through Global Chat's Notice yet.
Please do so by using the \`${await util.getPrefix(
          message.guild.id
        )}globalchat-notice\` command, then you may proceed through the next step provided by the command.`);

        return setTimeout(() => msg.delete(), 10000);
      }

      // if the target's message is over 1024 characters, return
      if (message.content.length > 1024) {
        const msg = await message.channel.send(
          `**${message.author.toString()}**, Your message musn't be more than 1024 characters.`
        );

        return setTimeout(() => msg.delete(), 5000);
      }

      // check if the target is a bot staff
      const isBotStaff = await botStaffSchema.findOne({
        userId: message.author.id,
      });

      // urlify the message content so that the bot can see the difference
      // if the bot sees 1 or more differences, it will think that a newbie sent 1 or more links
      // eslint-disable-next-line no-empty
      if (client.isOwner(message.author) || isBotStaff) {
      } else if (gcInfo.messageCount < msgCountForApproval) {
        const urlify = util.urlify(message.content);
        if (urlify !== message.content) {
          const msg = await message.channel.send(
            `**${message.author.toString()}**, Links are not allowed for new members using this chat.`
          );

          return setTimeout(() => msg.delete(), 5000);
        }
      }

      if (
        referralDomains.some((v) => message.content.toLowerCase().includes(v))
      ) {
        const msg = await message.channel.send(
          `**${message.author.toString()}**, Referral links are prohibited for all members.`
        );

        return setTimeout(() => msg.delete(), 5000);
      }

      const urlify = util.urlify(message.content);
      if (urlify !== message.content) {
        if (
          !safeDomains.some((v) => message.content.toLowerCase().includes(v))
        ) {
          const msg = await message.channel.send(
            `${message.author.toString()}, That site you posted isn't one of the safe domains.\nIf the site is safe, consider suggesting **${
              botOwner.tag
            }** to add it into the list of safe domains.`
          );

          return setTimeout(() => msg.delete(), 5000);
        }
      }

      let placeholderMsg = message.content.toLowerCase();
      for (const word of whitelistedWords) {
        placeholderMsg = placeholderMsg.split(word.toLowerCase()).join("");
      }

      for (const profanity of profanities) {
        if (placeholderMsg.includes(profanity)) {
          const msg = await message.channel.send(
            `**${message.author.toString()}**, Watch your language.`
          );

          return setTimeout(() => msg.delete(), 5000);
        }
      }

      // if the target is in cooldown, return
      const cooldown = gcCooldowns.get(message.author.id);
      if (cooldown) {
        const remaining = humanizeDuration(cooldown - Date.now());
        const msg = await message.channel.send(
          `**${message.author.toString()}**, You are in cooldown for ${remaining}.`
        );

        return setTimeout(() => msg.delete(), 5000);
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
            .join(`@${user.tag}`)
            .split(`<@${user.id}>`)
            .join(`@${user.tag}`);

          message.content = modifiedMessageContent;
        });
      }

      // get the first message attachment
      const attachment = message.attachments.first();
      if (!attachment) if (!message.content) return;

      // depends on account status, have a designated badge append with their username
      let badgeDisplayed = "";
      if (gcInfo.customBadge) {
        badgeDisplayed = gcInfo.customBadge;
      } else if (client.isOwner(message.author)) {
        badgeDisplayed = badge.developer;
      } else if (isBotStaff) {
        badgeDisplayed = badge.staff;
      } else if (gcInfo.messageCount < msgCountForApproval) {
        badgeDisplayed = badge.newbie;
      } else {
        badgeDisplayed = badge.verified;
      }

      userLogCopy = userLog;
      userLog = message.author.id;

      if (timeout) clearTimeout(timeout);

      console.log(timeout);

      initTimeout();

      // for each guilds that the client was in
      client.guilds.cache.forEach(async (guild) => {
        let otherGCChannel;
        if (client.cache.globalChat[guild.id]) {
          otherGCChannel = client.cache.globalChat[guild.id];
        } else if (!client.cache.globalChat[guild.id]) {
          // fetch to see if the guild that the client chose have a global chat channel
          const otherGuildRes = await settingsSchema.findOne({
            guildId: guild.id,
          });

          if (!otherGuildRes || !otherGuildRes.settings.globalChat) return;

          client.cache.globalChat[guild.id] = otherGuildRes.settings.globalChat;
          otherGCChannel = client.cache.globalChat[guild.id];
        }

        const channel = guild.channels.cache.get(otherGCChannel);

        // if there's none, return
        if (!channel) return;

        let usernamePart = "";

        // check the guild is/isn't a guild test
        if (userLog !== userLogCopy) {
          if (!process.env.GUILD_TEST || guild.id !== process.env.GUILD_TEST) {
            usernamePart = `_ _\n[ ${badgeDisplayed} **\`${message.author.tag}\` - \`${message.guild.name}\`** ]`;
          } else if (guild.id === process.env.GUILD_TEST) {
            usernamePart = `
_ _\n[ ${badgeDisplayed} **\`${message.author.tag}\` - \`${message.guild.name}\`** ]
**userID: \`${message.author.id}\` - guildID: \`${message.guild.id}\`**`;
          }
        } else if (userLog === userLogCopy) {
          usernamePart = "";
        }

        // check if the message contains any attachments
        if (!attachment) {
          return await channel
            .send(`${usernamePart}\n${message.content}`)
            .catch((err) => {
              message.channel.send(
                `Can't deliver the message to **${guild}** for: ${err}`
              );
            });
        }

        // eslint-disable-next-line no-empty
        if (client.isOwner(message.author) || isBotStaff) {
        } else if (gcInfo.messageCount < msgCountForApproval) {
          const prohibitedMsg =
            "*Can't send attachments due to the status of being a newbie.*";
          return await channel
            .send(
              message.content
                ? `${usernamePart}\n${message.content}\n${prohibitedMsg}`
                : `${usernamePart}\n${prohibitedMsg}`
            )
            .catch((err) => {
              message.channel.send(
                `Can't deliver the message to **${guild}** for: ${err}`
              );
            });
        }

        if (!attachment.height || !attachment.width) {
          const prohibitedMsg =
            "*The user attempted to send something other than image and video.*";
          return await channel
            .send(
              message.content
                ? `${usernamePart}\n${message.content}\n${prohibitedMsg}`
                : `${usernamePart}\n${prohibitedMsg}`
            )
            .catch((err) => {
              message.channel.send(
                `Can't deliver the message to **${guild}** for: ${err}`
              );
            });
        }

        return await channel
          .send({
            content: message.content
              ? `${usernamePart}\n${message.content}`
              : `${usernamePart}_ _`,
            files: [attachment],
          })
          .catch((err) => {
            try {
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
      });

      // eslint-disable-next-line no-empty
    } catch (err) {}
  },
};
