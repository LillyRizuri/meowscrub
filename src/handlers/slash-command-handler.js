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

  function readCommands(dir) {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file));
      } else {
        const option = require(path.join(__dirname, dir, file));
        option.memberName = option.data.name;
        option.description = option.data.description;
        const initialFormat = [];
        if (option.data.options.length > 0) {
          option.data.options.forEach((opt) => {
            if (opt.required) initialFormat.push(`<${opt.name}>`);
            else initialFormat.push(`[${opt.name}]`);
          });
        }

        option.format = initialFormat.join(" ");
        arrayOfCommands.push(option.data.toJSON());
        client.slashCommands.set(option.data.name, option);
        commandBase(client, option);
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

  readCommands("../slash-commands");

  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

  try {
    // register guild-specific slash commands
    // await rest.put(
    //   Routes.applicationGuildCommands(client.user.id, process.env.GUILD_TEST),
    //   { body: arrayOfCommands }
    // );

    // register slash commands globally (cached for 1 hour)
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: arrayOfCommands,
    });

    console.log("Successfully registered application commands.");
  } catch (err) {
    console.log(err);
  }

  commandBase.listen(client);
};
