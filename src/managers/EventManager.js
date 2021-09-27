const { Collection, Constants: { Events: eventNames } } = require("discord.js"),
	path = require("path");

/**
 * Events go brrr!
 * @author Lilly Rizuri
 * @date 26/09/2021
 * @class EventManager
 * @extends {Collection}
 */
class EventManager extends Collection {
	/**
	 * Creates an instance of EventManager.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {import("../structures/Client")} client
	 * @memberof EventManager
	 */
	constructor(client) {
		super();

		/**
		 * The client.
		 * @type {import("../structures/Client")}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof EventManager
		 */
		this.client = client;
	}

	/**
	 * Loads an event.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {string} filePath
	 * @param {import("../structures/Client")} client
	 * @returns {import("../structures/Event").eventID}
	 * @memberof EventManager
	 */
	load(filePath) {
		if (filePath === void 0) {
			throw new ReferenceError("No file path was provided.");
		}

		// Generate a random id.
		const id = Math.random().toString(36).substring(7);

		if (this.has(id)) {
			return this.load(filePath);
		}

		/** @type {import("../structures/Event")} */
		const event = new (require(path.resolve(filePath)))(this.client);

		event.filePath = `${filePath}`;
		console.log(event.filePath);
		this.client.on(event.name, (...args) => {
			try {
				event.run(...args);
			} catch (e) {
				return this.client.error(e);
			}
		});
	}

	/**
	 * @description
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {string} eventResolvable A string that can be resolved as an event.
	 * 
	 * This can be an `eventID`, `eventName`, or a `filePath`.
	 * 
	 * @returns {this}
	 * @memberof EventManager
	 */
	unload(eventResolvable) {
		if (this.has(eventResolvable)) {
			this.client.removeListener(this.get(eventResolvable).name, this.get(eventResolvable).run);
			this.delete(eventResolvable);
			return this;
		}
		if (Object.values(eventNames).indexOf(eventResolvable) !== -1) {
			this.client.removeAllListeners(eventResolvable);
			this
				.filter(e => e.name === eventResolvable)
				.each(e => this.delete(e.id));
			return this;
		}
		if (this.filter(e => e.filePath === eventResolvable).size > 0) {
			this
				.filter(e => e.filePath === eventResolvable)
				.each(event => {
					this.client.removeListener(event.name, (...args) => {
						this.client.run(...args);
					});
					this.delete(event.id);
				});
			return this;
		}

		throw new Error("Unable to resolve an event from the provided string.");
	}
}

module.exports = EventManager;