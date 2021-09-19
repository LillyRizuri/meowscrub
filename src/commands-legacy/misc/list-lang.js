const languages = require("../../assets/json/languages.json");

module.exports = {
  aliases: ["list-lang", "listlang"],
  memberName: "list-lang",
  group: "misc",
  description: "Display all languages that are supported by Google Translate.",
  cooldown: 3,
  callback: async (client, message) => {
    const allIsoLanguages = Object.keys(languages);
    const langList = [];
    for (const isoLanguage of allIsoLanguages) {
      langList.push(`\`${isoLanguage}\`-${languages[isoLanguage]}`);
    }
    message.reply(`
All languages that are supported by Google Translate:
${langList.join(", ")}
        `);
  },
};
