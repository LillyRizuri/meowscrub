const settingsSchema = require("../../models/settings-schema");

const emoji = require("../../assets/json/tick-emoji.json");
const badge = require("../../assets/json/badge-emoji.json");
const markdownChars = require("../../assets/json/markdown-char.json");

module.exports = {
  aliases: ["global", "setglobal", "global-chat"],
  memberName: "global",
  group: "settings",
  description: "Set a Global Chat channel for this server.",
  details:
    "Replace the syntax with `disable` if you wish to remove the configuration.",
  format: "<#channel | channelID>",
  examples: ["setglobal #global", "setglobal disable"],
  userPermissions: ["MANAGE_GUILD"],
  singleArgs: true,
  cooldown: 3,
  guildOnly: true,
  callback: async (client, message, args) => {
    const guildId = message.guild.id;
    const channel =
      message.mentions.channels.first() ||
      message.guild.channels.cache.get(args);

    switch (args.toLowerCase()) {
      default: {
        if (!channel)
          return message.reply(
            emoji.missingEmoji +
              " No valid channel found for the configuration."
          );

        if (channel.type !== "GUILD_TEXT")
          return message.reply(
            emoji.denyEmoji + " It isn't a valid text channel."
          );

        if (!channel.viewable)
          return message.reply(
            emoji.denyEmoji + " I can't view your specified channel."
          );

        const lastSettings = await settingsSchema.findOne({
          guildId,
        });

        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.globalChat": channel.id,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        client.cache.globalChat[message.guild.id] = channel.id;

        message.channel.send(
          emoji.successEmoji + ` **Set the Global Chat Channel to:** ${channel}`
        );

        for (const markdownChar of markdownChars) {
          message.guild.name.replaceAll(markdownChar, `\\${markdownChar}`);
        }

        const badgeDisplayed = badge.bot;

        client.cache.userLogCopy = client.cache.userLog;
        client.cache.userLog = client.user.id;

        if (lastSettings && lastSettings.settings.globalChat) break;
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

            client.cache.globalChat[guild.id] =
              otherGuildRes.settings.globalChat;
            otherGCChannel = client.cache.globalChat[guild.id];
          }

          const ch = guild.channels.cache.get(otherGCChannel);

          // if there's none, return
          if (!ch) return;

          let usernamePart = "";

          if (client.cache.userLog !== client.cache.userLogCopy) {
            if (
              !process.env.GUILD_TEST ||
              guild.id !== process.env.GUILD_TEST
            ) {
              usernamePart = `_ _\n[ ${badgeDisplayed} **\`${client.user.tag}\` - \`${message.guild.name}\`** ]`;
            } else if (guild.id === process.env.GUILD_TEST) {
              usernamePart = `
_ _\n[ ${badgeDisplayed} **\`${client.user.tag}\` - \`${message.guild.name}\`** ]
**userID: \`${client.user.id}\` - guildID: \`${message.guild.id}\`**`;
            }
          } else if (client.cache.userLog === client.cache.userLogCopy) {
            usernamePart = "";
          }

          await ch
            .send(
              `${usernamePart}\nWelcome to Global Chat, **${message.guild.name}**.`
            )
            .catch((err) => {
              message.channel.send(
                `Can't deliver the message to **${guild}** for: ${err}`
              );
            });
        });
        break;
      }
      case "disable": {
        await settingsSchema.findOneAndUpdate(
          {
            guildId,
          },
          {
            guildId,
            $set: {
              "settings.globalChat": null,
            },
          },
          {
            upsert: true,
            useFindAndModify: false,
          }
        );
        client.cache.globalChat[message.guild.id] = null;

        message.channel.send(
          emoji.successEmoji +
            " **Removed the configuration for the Global Chat.**"
        );
        return;
      }
      case "": {
        const results = await settingsSchema.findOne({
          guildId,
        });

        if (!results || !results.settings.globalChat)
          return message.reply(
            emoji.missingEmoji + " The text channel hasn't been set yet."
          );
        else if (results && results.settings.globalChat)
          message.channel.send(
            emoji.successEmoji +
              ` **Current Global Chat Channel Configuration:** <#${results.settings.globalChat}>`
          );
        break;
      }
    }
  },
};
