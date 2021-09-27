const { User: _User } = require("discord.js");

class User extends _User {
	get isOwner() {
		if (typeof this.client.settings.owner === "string")
			return this.id === this.client.settings.owner;
	
		if (this.client.settings.owner instanceof Array)
			return this.client.settings.owner.includes(this.id);
	
		if (this.client.settings.owner instanceof Set)
			return this.client.settings.owner.has(this.id);
	
		throw new Error("The owner option is an unknown value.");
	}
}

module.exports = User;