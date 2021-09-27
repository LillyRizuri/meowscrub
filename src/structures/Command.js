/**
 * @author Lilly Rizuri
 * @date 26/09/2021
 * @typedef {Object} CommandOptions
 * 
 * @property {string[]} [aliases]
 * 	Aliases of the command.
 * @property {number} [cooldown = 2000]
 * 	The amount of time in milliseconds a user has to wait before running the command again.
 * @property {string} [description="No description provided."]
 * 	The description of the command.
 * @property {boolean} devOnly
 * 	Whether the user needs to be a developer to run the command.
 * @property {boolean} dmOnly
 * 	Whether the command needs to be ran in Direct Messages.
 * @property {boolean} enabled
 * 	Whether the command is enabled.
 * @property {boolean} enabledInGlobal
 * 	Whether the command is enabled in global.
 * @property {string[]} [examples]
 * 	Examples on how to use the command.
 * @property {boolean} guildOnly
 * 	Whether the command needs to be ran in a guild.
 * @property {string} name
 * 	The name of the command.
 * @property {object} perms
 * 	The permissions needed to run the command.
 * @property {import("discord.js").PermissionString} perms.bot
 * 	The permissions the bot needs to run the command.
 * @property {import("discord.js").PermissionString} perms.user
 *  The permissions the user needs to run the command.
 * @property {boolean} nsfw
 * 	Whether the command needs to be ran in an nsfw channel.
 * @property {string} usage
 * 	The usage for the command.
 */

/**
 * Default command options.
 * @author Lilly Rizuri
 * @date 26/09/2021
 * @type {CommandOptions}
 */
exports.defaultCommandOptions = {
	aliases: [],
	cooldown: 2000,
	description: "No description provided.",
	devOnly: false,
	dmOnly: false,
	enabled: true,
	enabledInGlobal: false,
	examples: [],
	guildOnly: false,
	name: null,
	nsfw: false,
	perms: {
		user: [],
		bot: [],
	},
	usage: null,
};

/**
 * Commands go brrr!
 * @author Lilly Rizuri
 * @date 26/09/2021
 * @class Command
 */
class Command {
	/**
	 * Creates an instance of Command.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {*} client
	 * @param {CommandOptions} options
	 * @memberof Command
	 */
	constructor(client, options = {}) {
		// Default options
		options = {
			...exports.defaultCommandOptions,
			...options,
		};

		// Check the cooldown.
		if (isNaN(options?.cooldown)) {
			options.cooldown = 2000;
		}

		// Check the name.
		if (
			options?.name === void 0 ||
			typeof options?.name !== "string" ||
			`${options?.name}`.split(" ").join(" ") === ""
		) {
			throw new ReferenceError("No command name was provided.");
		}

		// Check the description.
		if (options?.description !== void 0 && typeof options?.description !== "string") {
			throw new TypeError("Command description must be a string.");
		}

		/**
		 * Aliases for the command.
		 * @type {string[]}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.aliases = [
			...(options?.aliases || []),
		];

		/**
		 * The amount of time in milliseconds a user has to wait before running the command again.
		 * @type {number}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.cooldown = options?.cooldown || 2000;

		/**
		 * The description of the command.
		 * 
		 * If no description was provided this will default to "No description provided.".
		 * @type {string}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.description = options?.description || "No description provided.";

		/**
		 * Whether the user needs to be a developer to run the command.
		 * @type {boolean}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.devOnly = options?.devOnly || false;

		/**
		 * Whether the user needs to be a developer to run the command.
		 * @type {boolean}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.nsfw = options?.nsfw || false;

		/**
		 * Whether the command needs to be ran in Direct Messages.
		 * @type {boolean}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.dmOnly = options?.dmOnly || false;

		/**
		 * Whether the command is enabled.
		 * @type {boolean}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.enabled = options?.enabled || false;

		/**
		 * Whether the command is enabled in global.
		 * @type {boolean}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.enabledInGlobal = options?.enabledInGlobal || false;

		/**
		 * Examples on how to use the command.
		 * @type {string[]}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.examples = [
			...(options?.examples || []),
		];

		/**
		 * Whether the command needs to be ran in a guild.
		 * @type {boolean}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.guildOnly = options?.guildOnly || false;

		/**
		 * The name of the command.
		 * @type {string}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.name = options?.name || null;

		/**
		 * @property {object} perms
		 * 	The permissions needed to run the command.
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.perms = {
			/**
			 * The permissions the bot needs to run the command.
			 * @type {import("discord.js").PermissionString[]}
			 * @author Lilly Rizuri
			 * @date 26/09/2021
			 * @memberof Command.perms
			 */
			bot: [...(options?.perms?.bot || []),],

			/**
			 * The permissions the user needs to run the command.
			 * @type {import("discord.js").PermissionString[]}
			 * @author Lilly Rizuri
			 * @date 26/09/2021
			 * @memberof Command.perms
			 */
			user: [...(options?.perms?.user || []),],
		};

		/**
		 * The usage for the command.
		 * @type {string}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Command
		 */
		this.usage = options?.usage || null;
	}

	/**
	 * The permissions needed to run the command.
	 * @alias Command.perms
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @memberof Command
	 */
	get permissions() {
		return this.perms;
	}

	set permissions(perms) {
		return this.perms = perms;
	}

	/**
	 * Run command now.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @memberof Command
	 */
	async run() { }

	/**
	 * The category of the command.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @readonly
	 * @memberof Command
	 */
	get category() {
		return `${this?.filePath}`
			.replace(/[^\\\/]+\.js$/i, "")
			.split(/(\/|\\)/g)
			.filter(s => !RegExp(/(\\| |C\:)/gi).test(s) && s !== "" && s !== "/" && s !== "\\")
			.reverse()[0];
	}
}

module.exports = Command;