const Commando = require("discord.js-commando");
const Discord = require("discord.js");

const globalChatSchema = require("../../models/global-chat-schema");

const collection = new Discord.Collection();

module.exports = class GlobalChatLeaderboardCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: "gc-leaderboard",
      aliases: ["gc-lb", "gc-top"],
      group: "misc",
      memberName: "gc-leaderboard",
      description: "Check the global chat leaderboard.",
      clientPermissions: ["EMBED_LINKS"],
      guildOnly: true,
    });
  }

  async run(message) {
    try {
      await Promise.all(
        message.guild.members.cache.map(async (member) => {
          const id = member.id;
          let results = await globalChatSchema.findOne({
            userId: member.id,
          });

          if (!results) {
            await new globalChatSchema({
              userId: member.id,
              messageCount: 0,
            }).save();

            results = await globalChatSchema.findOne({
              userId: member.id,
            });
          }

          const msgCount = results.messageCount;
          return msgCount !== 0
            ? collection.set(id, {
                id,
                msgCount,
              })
            : null;
        })
      );

      const data = collection.sort((a, b) => b.msgCount - a.msgCount).first(10);
      const leaderboardMap = data.map((v, i) => {
        return `**${i + 1}.** ${
          this.client.users.cache.get(v.id).tag
        } • **${v.msgCount.toLocaleString()} Msg**`;
      });

      if (!leaderboardMap)
        return message.reply(
          "<:scrubnull:797476323533783050> There's no leaderboard? Weird."
        );

      const findAuthorMsg = collection.find(
        (user) => user.id === message.author.id
      );

      const leaderboardEmbed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .setAuthor(`${collection.size} member(s) total used Global Chat`)
        .setTitle("Top 10's in Global Chat")
        .setDescription(leaderboardMap)
        .setFooter(`Your total messages counted: ${findAuthorMsg.msgCount}`);
      message.channel.send(leaderboardEmbed);
    } catch (err) {
      return message.reply(
        "<:scrubnull:797476323533783050> There's no leaderboard? Weird."
      );
    }
  }
};
