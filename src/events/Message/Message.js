const Event = require("../../structures/Event");

class Message extends Event {
	constructor(client) {
		super(client, {
			name: "message",
		});
	}

	async run(message) {
		try {
			this.runCommand(message);
		} catch (e) {
			return this.client.error(e);
		}
	}

	/**
	 * @description Command run function.
	 * @author Jay Rizuri
	 * @date 26/04/2021
	 * @param {Message} message
	 * @memberof MessageSend
	 */
	async runCommand(message) {
		try {
			if (message.author.bot || message.isWebhook) {
				return;
			}
			let prefix = this.client.prefix,
				isMentionPrefix = false;

			// Custom Prefixes
			if (message.channel.type !== "dm") {
				prefix = message.guild.settings?.prefix !== void 0 ?
					message.guild.settings?.prefix :
					this.client.prefix;
			}

			// Mention
			if (RegExp(`^<@(!)?${this.client.user.id}>$`, "gi").test(`${message.content}`)) {
				return message.reply(`My prefix is ${prefix}`);
			}

			// Mention Prefix
			if (`${message.content}`.indexOf(`<@${this.client.user.id}> `) === 0) {
				prefix = `<@${this.client.user.id}> `;
				isMentionPrefix = true;
			} else if (`${message.content}`.indexOf(`<@!${this.client.user.id}> `) === 0) {
				prefix = `<@!${this.client.user.id}> `;
				isMentionPrefix = true;
			}

			// Args n shit
			let args = `${message.content}`.slice(typeof prefix === "string" ? prefix.length : 0).trim().split(/ +/g),
				commandString = Array(args.shift())[0].toLowerCase(), command;

			if (!`${message.content}`.toLowerCase().startsWith(`${prefix}${commandString}`)) {
				return;
			}

			command = this.client.commands.find(c =>
				c.aliases.indexOf(commandString) !== -1 ||
				c.name === commandString
			);

			if (!command) {
				return;
			}

			// Command Checks

			if (!command.enabled || RegExp(/\{sami(db)?(\.)?disable(d)?((\.)?command(s)?)\}/gi).test(`${message?.channel?.topic}`)) {
				return //message.reply(this.client.err.get("06")).then(m => m.delete({ timeout: 3000 }));
			}

			// if (command?.enabledInPortals === false && this.client.Portal.portals.has(message.channel.id)) {
				// return //message.error`07`;
			// }

			if (!message.member.permissions.has(command.perms.user)) {
				return //message.error`01`;
			}

			if (!message.guild.me.permissions.has(command.perms.bot)) {
				return //message.error`02`;
			}

			if (command.guildOnly && message.channel.type === "dm") {
				return //message.error`03`;
			}

			if (command.nsfw && !message.channel.nsfw) {
				return //message.error`04`;
			}

			if (command.devOnly && !message.author.isOwner) {
				return //message.error`05`;
			}

			// Cooldowns

			// let cooldowns = this.client.commandCooldown.has(message.author.id) ?
			// 	this.client.commandCooldown.get(message.author.id) :
			// 	this.client.commandCooldown.set(message.author.id, new Collection());

			// Check cooldowns
			// if (cooldowns.has(command.meta.name)) {
			// 	if (command.cooldown - (Date.now() - cooldowns.get(command.meta.name)) > 0) {
			// 		return message.error("08", Math.ceil((command.cooldown - (Date.now() - cooldowns.get(command.meta.name))) / 1000));
			// 	}
			// }

			// Set cooldowns.
			// cooldowns.set(command.meta.name, message.createdTimestamp);
			// this.client.commandCooldown.set(message.author.id, cooldowns);

			try {
				// this.logCommand(message, this.client);
				await command.run(message, args, this.client, isMentionPrefix || false);
			} catch (e) {
				console.log(e);
				// this.client.error(e);
				// return message.error`00`;
			}
		} catch (e) {
			console.error(e);
		}
	}
}

module.exports = Message;