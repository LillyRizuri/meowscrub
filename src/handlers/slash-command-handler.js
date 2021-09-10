const Discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const path = require("path");
const fs = require("fs");

module.exports = async (client) => {
  client.slashCommands = new Discord.Collection();
  client.slashRegistryGroups = new Discord.Collection();

  const arrayOfCommands = [];
  const baseFile = "slash-command-base.js";
  const commandBase = require(`./${baseFile}`);

  function readSlashCommands(dir) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readSlashCommands(path.join(dir, file));
      } else {
        let option = require(path.join(__dirname, dir, file));
        option = commandBase(client, option);
        if (option.data.type === 2 || option.data.type === 3) {
          arrayOfCommands.push(option.data);
        } else {
          arrayOfCommands.push(option.data.toJSON());
        }
        client.slashCommands.set(option.data.name, option);
      }
    }

    client.commandGroups.forEach((group) => {
      const commands = client.slashCommands.filter(
        (command) => command.group === group[0]
      );

      client.slashRegistryGroups.set(group[0], {
        id: group[0],
        name: group[1],
        emoji: group[2] ? group[2] : null,
        commands: commands,
      });
    });
  }

  readSlashCommands("../slash-commands");

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

  async function registerSlashCommands(globalCommand = false) {
    try {
      // for (const command of await client.api.applications(client.user.id).commands.get()) {
      //   client.api.applications(client.user.id).commands(command.id).delete();
      // }

      if (!globalCommand) {
        await rest.put(
          Routes.applicationGuildCommands(
            client.user.id,
            process.env.GUILD_TEST
          ),
          { body: arrayOfCommands }
        );

        console.log("Successfully registered guild-specific slash commands.");
      } else if (globalCommand) {
        await rest.put(Routes.applicationCommands(client.user.id), {
          body: arrayOfCommands,
        });

        console.log("Successfully registered global slash commands.");
      }
    } catch (err) {
      console.log(err);
    }
  }

  await registerSlashCommands(false);
  commandBase.listen(client);
};
