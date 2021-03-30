module.exports = (client) => {
  client.snipe = new Map();
  client.on("messageDelete", function (message, channel) {
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
  });
};
