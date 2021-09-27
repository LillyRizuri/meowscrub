/**
 * Represents an event.
 * @author Lilly Rizuri
 * @date 26/09/2021
 * @class Event
 */
class Event {

	/**
	 * @typedef {"rateLimit" |  "ready" |  "resumed" |  "guildCreate" |  "guildDelete" |  "guildUpdate" |  "inviteCreate" |  "inviteDelete" |  "guildUnavailable" |  "guildMemberAdd" |  "guildMemberRemove" |  "guildMemberUpdate" |  "guildMemberAvailable" |  "guildMemberSpeaking" |  "guildMembersChunk" |  "guildIntegrationsUpdate" |  "roleCreate" |  "roleDelete" |  "roleUpdate" |  "emojiCreate" |  "emojiDelete" |  "emojiUpdate" |  "guildBanAdd" |  "guildBanRemove" |  "channelCreate" |  "channelDelete" |  "channelUpdate" |  "channelPinsUpdate" |  "message" |  "messageDelete" |  "messageUpdate" |  "messageDeleteBulk" |  "messageReactionAdd" |  "messageReactionRemove" |  "messageReactionRemoveAll" |  "userUpdate" |  "presenceUpdate" |  "voiceStateUpdate" |  "subscribe" |  "unsubscribe" |  "typingStart" |  "webhookUpdate" |  "disconnect" |  "reconnecting" |  "error" |  "warn" |  "debug" |  "shardDisconnect" |  "shardError" |  "shardReconnecting" |  "shardReady" |  "shardResume" |  "invalidated" |  "raw" } EventName
	 */

	/**
	 * @typedef {string} eventID
	 */

	/**
	 * @typedef {string} filePath
	 */

	/**
	 * @typedef {filePath} eventResolvable
	 */

	/**
	 * @typedef {EventName} eventResolvable
	 * @variation 2
	 */

	/**
	 * Creates an instance of an `Event`.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {import("../structures/Client")} client
	 * @param { { name: EventName, } } options The options for the event.
	 * @memberof Event
	 */
	constructor(client, options) {
		/**
		 * The client.
		 * @type {import("../structures/Client")}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Event
		 */
		this.client = client;

		if (options === void 0) {
			throw new ReferenceError("No options were provided.");
		}

		/**
		 * The name of the event.
		 * @type {EventName}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Event
		 */
		this.name = options?.name;

		/**
		 * The id of the event.
		 * @type {eventID}
		 * @author Lilly Rizuri
		 * @date 26/09/2021
		 * @memberof Event
		 */
		this.id;
	}

	/**
	 * The run function.
	 * @author Lilly Rizuri
	 * @date 26/09/2021
	 * @param {*} args
	 * @memberof Event
	 */
	async run(...args) {

	}
}

module.exports = Event;
