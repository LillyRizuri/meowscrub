require("dotenv").config();

const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const DisTube = require("distube");
const { DiscordTogether } = require("discord-together");
const path = require("path");
const fs = require("fs");

const client = new Commando.CommandoClient({
  // Bot Owner ID goes here
  owner: [process.env.OWNERID, process.env.OWNERID2],
  // Default Bot Prefix goes here
  commandPrefix: process.env.PREFIX,
  // Discord Support Server Invite surrounded with "<>" goes here
  invite: `<${process.env.DISCORDINVITE}>`,
  // Do not modify this for safety purposes
  disableMentions: "everyone",
  partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
  intents: new Discord.Intents(Discord.Intents.ALL),
});

client.playSongLog;

require("discord-buttons")(client);
client.discordTogether = new DiscordTogether(client);

client.distube = new DisTube(client, {
  searchSongs: false,
  emitNewSongOnly: true,
  leaveOnFinish: true,
  youtubeDL: true,
  updateYouTubeDL: true,
  youtubeCookie: process.env.YTCOOKIE,
});

module.exports = client;

client.on("ready", async () => {
  client.registry
    .registerGroups([
      ["conventional", "Conventional Commands"],
      ["moderation", "Moderation Commands"],
      ["settings", "Guild Settings"],
      ["ticket", "Ticket-Related Commands"],
      ["funs", "Some Really Simple Fun Stuff"],
      ["soundboard", "Soundboard!"],
      ["music-library", "Frockle's Music Library"],
      ["music", "Music Controller"],
      ["discord-together", "Discord Together"],
      ["economy", "Economy System"],
      ["images", "Pictures Retrieval"],
      ["encoders", "Message Encoders"],
      ["covid-related", "COVID-19 Related Commands"],
      ["misc", "Miscellaneous Stuff"],
      ["owner-only", "Bot Owner Only"],
      ["utility", "Extra Utilities"],
      ["notice", "Bot Notice"],
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, "cmds"));
  console.log(
    "Initialized frockles (meowscrub) successfully. Give it a warm welcome."
  );
});

// Event Handler [All essential parts of the bot goes to the events folder]
const eventFiles = fs
  .readdirSync("./src/events/")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

process.on("uncaughtException", console.log);

client
  .on("debug", console.log)
  .on("warn", console.log)
  .login(process.env.TOKEN);

// repl.it stuff
const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok so how did you get here");
});

server.listen(3000);
