const Discord = require("discord.js");
// const client = new Discord.Client()
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const MongoDBProvider = require("commando-provider-mongo").MongoDBProvider;
const path = require("path");
const Commando = require("discord.js-commando");
const DisTube = require("distube");

const chatbot = require("./events/auto-chatbot");
const welcomeMsg = require("./events/welcome-msg");
const afkStatus = require("./events/afk-status");
const msgSnipe = require("./events/msg-snipe");
const editSnipe = require("./events/edit-snipe");
const globalChat = require("./events/global-chat");

const mongo = require("./mongo");
const { green, what } = require("./assets/json/colors.json");

const client = new Commando.CommandoClient({
  // Bot Owner ID goes here
  owner: process.env.OWNERID,
  // Default Bot Prefix goes here
  commandPrefix: process.env.PREFIX,
  // Discord Support Server Invite surrounded with "<>" goes here
  invite: `<${process.env.DISCORDINVITE}>`,
  // Do not modify this for safety purposes
  disableMentions: "everyone",
});

// Saving configurations to MongoDB
client.setProvider(
  MongoClient.connect(process.env.MONGO)
    .then((clientSettings) => {
      return new MongoDBProvider(clientSettings, "FrocklesDatabases");
    })
    .catch((err) => {
      console.error(err);
    })
);

// Please rename "FrocklesDatabases" to your collection's name

client.on("ready", async () => {
  // Support for music playback
  client.distube = new DisTube(client, {
    searchSongs: false,
    emitNewSongOnly: true,
    leaveOnFinish: true,
    youtubeCookie: process.env.YTCOOKIE,
  });
  /* To get your YouTube Cookie:
  / - Log in using your dummy channel (HIGHLY recommended because autoplay)
  / - Navigate to YouTube in a web browser
  / - Open up Developer Tools (opt+cmd+j on mac, ctrl+shift+j on windows)
  / - Go to the Network Tab
  / - Click on `sw.js_data` when it appears
  / - Scroll down to "Request Headers"
  / - Find the "cookie" header and copy its entire contents
  */
  client.distube
    .on("initQueue", (queue) => {
      queue.autoplay = false;
      queue.volume = 100;
    })
    .on("playSong", async (message, queue, song) => {
      const playingEmbed = new Discord.MessageEmbed()
        .setColor(green)
        .setThumbnail(song.thumbnail)
        .setDescription(
          `
<:scrubgreen:797476323316465676> **Now Playing:**
[${song.name}](${song.url}) - **${song.formattedDuration}**
  `
        )
        .setFooter(`Requested by: ${song.user.tag}`)
        .setTimestamp();
      message.channel.send(playingEmbed);
    })
    .on("addSong", (message, queue, song) => {
      const playingEmbed = new Discord.MessageEmbed()
        .setColor(green)
        .setThumbnail(song.thumbnail)
        .setDescription(
          `
<:scrubgreen:797476323316465676> **Added to the queue.**
[${song.name}](${song.url}) - **${song.formattedDuration}**
  `
        )
        .setFooter(`Added by: ${song.user.tag}`)
        .setTimestamp();
      message.channel.send(playingEmbed);
    })
    .on("empty", (message) => {
      const emptyChannelEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> **VC Empty. Leaving the channel...**"
        );
      message.channel.send(emptyChannelEmbed);
    })
    .on("noRelated", (message) => {
      const noRelatedMusicEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> **No related music can be found. Leaving the VC...**"
        );
      message.channel.send(noRelatedMusicEmbed);
    })
    .on("finish", (message) => {
      const endQueueEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription(
          "<:scrubnull:797476323533783050> **No more songs in queue. Leaving...**"
        );
      message.channel.send(endQueueEmbed);
    })
    .on("error", (message, err) => {
      const errorEmbed = new Discord.MessageEmbed()
        .setColor("#ff0000")
        .setTitle("(Un)expected Error Occurred.")
        .setDescription(`\`\`\`${err}\`\`\``);
      message.channel.send(errorEmbed);
    });

  // Bot Status
  function presence() {
    const status = require("./assets/json/bot-status.json");
    const randomStatus = Math.floor(Math.random() * status.length);

    client.user.setPresence({
      status: "online",
      activity: {
        name: status[randomStatus],
        type: "WATCHING",
      },
    });
  }

  // changing status varying from 30 seconds to 10 minutes
  const randomTimerStatus = Math.floor(Math.random() * 600000 + 30000);
  setInterval(presence, randomTimerStatus);

  // Connecting to MongoDB
  const connectToMongoDB = async () => {
    await mongo().then(() => {
      console.log("Successfully Connected to MongoDB Atlas.");
    });
  };
  connectToMongoDB();

  client.registry
    .registerGroups([
      ["conventional", "Conventional Commands"],
      ["moderation", "Moderation Commands"],
      ["economy", "Economy System"],
      ["images", "Pictures Retrieval"],
      ["encoders", "Message Encoders"],
      ["covid-related", "COVID-19 Related Commands"],
      ["funs", "Some Really Simple Fun Stuff"],
      ["soundboard", "Soundboard!"],
      ["music-library", "Frockle's Music Library"],
      ["music", "Music Controller"],
      ["misc", "Miscellaneous Stuff"],
      ["utility", "Extra Utilities"],
      ["settings", "Guild Settings"],
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, "cmds"));

  msgSnipe(client);
  editSnipe(client);
  welcomeMsg(client);

  console.log(
    "Initialized frockles (meowscrub) successfully. Give it a warm welcome."
  );
});

client
  .on("debug", console.log)
  .on("warn", console.log)
  .on("message", (message) => {
    afkStatus(client, message);
    chatbot(client, message);
    globalChat(client, message);
  });

client.login(process.env.TOKEN);

// repl.it stuff
const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});

server.listen(3000);