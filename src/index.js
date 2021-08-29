Object.defineProperty(String.prototype, "toProperCase", {
  value: function () {
    return this.replace(
      /([^\W_]+[^\s-]*) */g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
});

require("dotenv").config();

const Discord = require("discord.js");
const DisTube = require("distube");
const { DiscordTogether } = require("discord-together");
const mongoose = require("mongoose");

const client = new Discord.Client({
  allowedMentions: {
    parse: ["roles", "users"],
    repliedUser: true,
  },
  partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
  intents: 32767,
});

// Connecting to MongoDB
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Successfully connected to your MongoDB Database.");
  });

client.owner = process.env.OWNERS.split(",");
client.commandGroups = [
  ["covid", "Covid-Related Commands", "<:virus:877817262692769813>"],
  ["discord-together", "Discord Together", "🎮"],
  ["economy", "Economy System", "💵"],
  ["funs", "Really Simple Fun Stuff", "🎭"],
  ["images", "Images API", "🖼"],
  ["info", "Information & Such", "<:monitor:877822719004127312>"],
  ["misc", "Miscellaneous Stuff", "<:dots:877933696890589255>"],
  ["moderation", "Moderation Stuff", "🛠"],
  ["music", "Music-Related Commands", "<:headphones:877930317015572581>"],
  ["music-lib", "Short Music Library", "🎼"],
  ["owner-only", "Owner-Only Tools", "👮‍♂️"],
  ["settings", "Server Settings", "<:gear:877813686180405248>"],
  ["soundboard", "Soundboard!", "🎹"],
  ["tags", "Tags / Custom Commands", "<:console:880332764266758204>"],
  ["ticket", "Ticket-Related Commands", "🎫"],
  ["util", "Utility", "🔧"],
];
client.discordTogether = new DiscordTogether(client);
client.distube = new DisTube.default(client, {
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  leaveOnFinish: true,
  youtubeDL: true,
  updateYouTubeDL: true,
  youtubeCookie: process.env.YTCOOKIE,
});
client.isOwner = function isOwner(user) {
  user = client.users.resolve(user);
  if (!user) throw new Error("Unable to resolve user.");
  if (typeof client.owner === "string") return user.id === client.owner;
  if (client.owner instanceof Array) return client.owner.includes(user.id);
  if (client.owner instanceof Set) return client.owner.has(user.id);
  throw new Error("The owner option is an unknown value.");
};

module.exports = client;

require("./handlers/event-handler")(client);

client.on("ready", async () => {
  await require("./handlers/command-handler")(client);

  console.log(
    "Initialized frockles (meowscrub) successfully. Give it a warm welcome."
  );
});


process.on("uncaughtException", console.log);
client
  .on("debug", console.log)
  .on("warn", console.log)
  .login(process.env.TOKEN);
