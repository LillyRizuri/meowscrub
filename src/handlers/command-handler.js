const path = require("path");
const fs = require("fs");

const { getPrefix } = require("../util/modules");

module.exports = async (client) => {
  const arrayOfCommands = [];
  const baseFile = "command-base.js";
  const commandBase = require(`./${baseFile}`);

  async function readCommands(dir) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file));
      } else if (file !== baseFile) {
        const option = require(path.join(__dirname, dir, file));

        // const newAliases = [];
        // for (let i = 0; i < option.aliases.length; i++) {
        //   const aliasPiece = option.aliases[i];
        //   const patternReplace = aliasPiece.split(/-/g).join(/(?:.+)?/g);
        //   // eslint-disable-next-line no-empty
        //   if (patternReplace === aliasPiece) {
        //   } else {
        //     newAliases.push(patternReplace);
        //   }
        // }

        // option.aliases = option.aliases.concat(newAliases);

        arrayOfCommands.push(option);
        client.commands.set(option.memberName, option);

        commandBase(client, option);
      }
    }

    client.commandGroups.forEach((group) => {
      const commands = client.commands.filter(
        (command) => command.group === group[0]
      );

      client.registryGroups.set(group[0], {
        id: group[0],
        name: group[1],
        emoji: group[2] ? group[2] : null,
        commands: commands,
      });
    });
  }

  async function loadPrefixes() {
    for (const guild of client.guilds.cache) {
      const guildId = guild[1].id;
      const result = await getPrefix(guildId);
      client.guildPrefixes[guildId] = result;
    }

    console.log("Loaded all prefix for all guilds.");
  }

  await loadPrefixes();
  await readCommands("../commands");
  await commandBase.listen(client);

  if (client.commands.size !== arrayOfCommands.length)
    throw new Error("Two or more commands have the same memberName.");
};
