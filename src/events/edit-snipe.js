module.exports = (client) => {
  client.editsnipe = new Map();
  client.on("messageUpdate", (message) => {
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
  });
};
