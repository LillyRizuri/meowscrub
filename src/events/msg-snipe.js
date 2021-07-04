module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (message.channel.type === "dm") return;
    client.snipe = new Map();
    switch (message.channel.nsfw) {
      case false:
        client.snipe.set(message.channel.id, {
          content: message.content,
          authorId: message.author.id,
          authorTag: message.author.tag,
          createdAt: message.createdAt,
          avatar: message.author.displayAvatarURL(),
          attachments: message.attachments.first()
            ? message.attachments.first().proxyURL
            : null,
        });
        break;
      case true:
        return;
    }
  },
};
