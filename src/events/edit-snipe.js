module.exports = {
  name: "messageUpdate",
  async execute(message, newMessage, client) {
    if (message.channel.type === "dm") return;
    client.editsnipe = new Map();
    switch (message.channel.nsfw) {
      case false:
        client.editsnipe.set(message.channel.id, {
          url: message.url,
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
