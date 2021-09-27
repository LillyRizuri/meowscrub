const { Collection } = require("discord.js"),
	{ relative, resolve } = require("path"),
	Command = require("../structures/Command");

/**
 * @author Lilly Rizuri
 * @date 26/09/2021
 * @class CommandManager
 * @extends {Collection}
 */
class CommandManager extends Collection {
	/**
	 * Creates an instance of Commands.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {import("../structures/Client")} client
	 * @param { ReadonlyArray< [key, value]> | null } entries
	 * @memberof CommandManager
	 */
	constructor(client, entries) {
		// Initialize Command Collection.
		super(entries);

		/**
		 * The client.
		 * @type {import("../structures/Client")}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof CommandManager
		 */
		this.client = client;
	}

	/**
	 * Loads a command.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {string} string The path to the command.
	 * @returns { Command | void }
	 * @memberof CommandManager
	 */
	load(filePath) {
		try {
			const command = new (require(resolve(filePath)))(this.client);
			command.filePath = resolve(filePath);

			if (command.init) {
				command.init(this);
			}
			
			this.set(command.name, command);
			return this.get(command.name, command);
		} catch (e) {
			return console.error(e);
		}
	}

	/**
	 * Unloads a command and returns it.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {string} commandResolvable A string that can be resolved as a command.
	 * 
	 * This can be a `commandName`, `commandAlias`, or a `filePath`.
	 * 
	 * @memberof CommandManager
	 */
	unload(commandResolvable) {
		let command;
		
		if (this.filter(c => [c.name, ...c.aliases].indexOf(commandResolvable) !== -1).size > 0) {
			command = this.filter(c => [c.name, ...c.aliases].indexOf(commandResolvable) !== -1).first();
		}

		if (this.filter(c => c.filePath === commandResolvable).size > 0) {
			command = this.filter(c => c.filePath === commandResolvable).first();
		}

		if (command === void 0) {
			throw new Error("Unable to resolve a command from the provided string.");
		}

		this.delete(command.name);

		delete require.cache[require.resolve(command.filePath)];
		return command;
	}
}

module.exports = CommandManager;