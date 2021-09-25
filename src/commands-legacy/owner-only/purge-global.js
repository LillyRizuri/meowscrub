const Discord = require("discord.js");

const botStaffSchema = require("../../models/bot-staff-schema");
const settingsSchema = require("../../models/settings-schema");

const confirmId = "confirmPurging";
const abortId = "cancelPurging";

const emoji = require("../../assets/json/tick-emoji.json");

module.exports = {
  aliases: ["purge-global", "global-purge", "clean-global"],
  memberName: "purge-global",
  group: "owner-only",
  description: "Purge messages in Global Chat.",
  details:
    "USE IT WISELY. USING THIS COMMAND MULTIPLE TIME IS CONSIDERED API ABUSE.",
  format: "<number>",
  examples: ["purge-global 10"],
  clientPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
  userPermissions: ["MANAGE_MESSAGES", "READ_MESSAGE_HISTORY"],
  cooldown: 15,
  singleArgs: true,
  guildOnly: true,
  callback: async (client, message, args) => {
    const isBotStaff = await botStaffSchema.findOne({
      userId: message.author.id,
    });

    // eslint-disable-next-line no-empty
    if (isBotStaff || client.isOwner(message.author)) {
    } else {
      return message.reply(
        emoji.denyEmoji +
          " Messing with this command is unauthorized by regulars.\nOnly intended for bot owner(s) and bot staff(s)."
      );
    }

    if (!args[0])
      return message.reply(
        emoji.missingEmoji +
          " No valid numbers of messages that you want to clean..."
      );

    const amountToDelete = Number(args[0]);

    if (isNaN(amountToDelete))
      return message.reply(
        emoji.denyEmoji + " Are you trying to break me using things like that?"
      );

    if (!Number.isInteger(amountToDelete))
      return message.reply(
        emoji.denyEmoji +
          " How am I supposed to purge if the value isn't an integer?"
      );

    if (!amountToDelete || amountToDelete > 100)
      return message.reply(
        emoji.denyEmoji +
          " The number of messages you want to clean must be somewhere in-between 2 and 100."
      );

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setStyle("SUCCESS")
        .setCustomId(confirmId)
        .setLabel("Confirm"),
      new Discord.MessageButton()
        .setStyle("DANGER")
        .setCustomId(abortId)
        .setLabel("Abort")
    );

    const msg = await message.reply({
      content: `
Are you absolutely sure that you want to purge ${amountToDelete} message(s) in Global Chat?
Abusing this command is considered Discord API abuse, so do not execute the command repeatedly unless someone has sent:
\`\`\`
 • Any kind of NSFW content
 • Any scam websites
 • Content that promotes their stuff
\`\`\`
**Confirm your choice.**
`,
      components: [row],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;
    msg
      .awaitMessageComponent({ filter, time: 30000, componentType: "BUTTON" })
      .then(async (interaction) => {
        for (let i = 0; i < row.components.length; i++) {
          if (
            interaction.customId.toLowerCase() ===
            row.components[i].customId.toLowerCase()
          ) {
            row.components[i].setDisabled();
          } else {
            row.components[i].setStyle("SECONDARY").setDisabled();
          }
        }

        interaction.deferUpdate();

        await interaction.message.edit({
          content: " Please wait for the purge... This will take a while...",
          components: [row],
        });

        switch (interaction.customId) {
          case confirmId: {
            let errorMessages = "";
            await new Promise((resolve) => {
              const channels = [];
              client.guilds.cache.forEach(async (guild) => {
                let otherGCChannel;
                if (client.cache.globalChat[guild.id]) {
                  otherGCChannel = client.cache.globalChat[guild.id];
                } else if (!client.cache.globalChat[guild.id]) {
                  // fetch to see if the guild that the client chose have a global chat channel
                  const otherGuildRes = await settingsSchema.findOne({
                    guildId: guild.id,
                  });

                  if (!otherGuildRes || !otherGuildRes.settings.globalChat)
                    return;

                  client.cache.globalChat[guild.id] =
                    otherGuildRes.settings.globalChat;
                  otherGCChannel = client.cache.globalChat[guild.id];
                }

                const channel = guild.channels.cache.get(otherGCChannel);

                // if there's none, return
                if (!channel) return;

                channels.push(channel);
              });

              let successes = 0;
              channels.forEach((channel, i) => {
                setTimeout(async () => {
                  try {
                    await channel.bulkDelete(amountToDelete);
                    throw true;
                  } catch (e) {
                    if (e === true) successes = successes + 1;
                    else
                      errorMessages += ` • Error in "${channel.guild.name}": ${e}\n`;
                  }
                  if (i === channels.length - 1) resolve(successes);
                }, 2000);
              });
            });

            await interaction.message.edit({
              content:
                emoji.successEmoji +
                ` Cleaned **${amountToDelete}** message(s) in Global Chat.${errorMessages ? `\n\`\`\`\n${errorMessages}\n\`\`\`` : ""}`,
              components: [row],
            });
            break;
          }
          case abortId:
            await interaction.message.edit({
              content: "Operation aborted.",
              components: [row],
            });
            break;
        }
      })
      .catch(() => {
        message.channel.send(
          `${message.author.toString()}, No reaction after 30 seconds, operation aborted.`
        );
      });
  },
};
