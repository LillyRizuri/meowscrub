const { Client: _Client, Structures } = require("discord.js"),
	{ join }		= require("path"),
	{ readdirSync } = require("fs"),
	CommandManager = require("../../managers/CommandManager"),
	EventManager = require("../../managers/EventManager");
const path = require("path");

for (const extended of readdirSync(`${__dirname}/Extended`)) {
	Structures.extend(extended.replace(".js", ""), (...extendable) => {
		return require(`${__dirname}/Extended/${extended}`)
	});
}

/**
 * Client goes brrr.
 * @author Lilly Rizuri
 * @date 26/09/2021
 * @class Client
 * @extends {_Client}
 */
class Client extends _Client {
	/**
	 * Creates an instance of Client.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {import("discord.js").ClientOptions} options
	 * @memberof Client
	 */
	constructor(options) {
		super({
			...options,
		});

		this.settings = {
			defaultPrefix:				process.env.PREFIX,
			mongoConnectionPath:		process.env.MONGO,
			ticketButtonId:				"openTicket",
			commandsPath:				join(__dirname, "commands-legacy"),
			applicationCommandsPath:	join(__dirname, "commands-application"),
			eventsPath:					join(__dirname, "events"),
			owner:						process.env.OWNERS.split(","),
		};

		this.commands	= new CommandManager(this);
		this.events		= new EventManager(this);

		process
			.on("uncaughtException", console.log);

		this
			.on("debug", console.log)
			.on("warn", console.log)
			.login(process.env.TOKEN);
	}

	get prefix() {
		return this.settings.defaultPrefix;
	}
}

module.exports = Client;