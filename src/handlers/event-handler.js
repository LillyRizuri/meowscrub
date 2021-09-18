const path = require("path");
const fs = require("fs");

module.exports = (client) => {
  function readListeners(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const stat = fs.lstatSync(path.join(dir, file));
      if (stat.isDirectory()) {
        readListeners(path.join(dir, file));
      } else {
        const listenerFile = require(path.join(dir, file));
        if (listenerFile.once) {
          client.once(listenerFile.name, (...args) =>
            listenerFile.execute(...args, client)
          );
        } else {
          client.on(listenerFile.name, (...args) =>
            listenerFile.execute(...args, client)
          );
        }
      }
    }
  }

  readListeners(client.settings.eventsPath);
};
