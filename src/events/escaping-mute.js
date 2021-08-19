const mutedSchema = require("../models/muted-schema");
const settingsSchema = require("../models/settings-schema");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const settingsOutput = await settingsSchema.findOne({
      guildId: member.guild.id,
    });

    const results = await mutedSchema.findOne({
      guildId: member.guild.id,
    });

    if (!results) return;
    const user = results.users.findIndex((prop) => prop === member.id);
    if (user === -1) return;

    const mutedRole = member.guild.roles.cache.find(
      (e) => e.id === settingsOutput.settings.muteRole
    );

    member.roles.add(mutedRole, `${member.user.tag} attempted to escape their mute`);
  },
};
