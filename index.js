const Discord = require('discord.js')
// const client = new Discord.Client()
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient
const MongoDBProvider = require('commando-provider-mongo').MongoDBProvider
const path = require('path')
const Commando = require('discord.js-commando')
const DisTube = require('distube')

const config = require('./config.json')
const poll = require('./events/auto-poll')
const mongo = require('./mongo')
const chatbot = require('./events/auto-chatbot')
const welcomeMsg = require('./events/welcome-msg')
const afkStatus = require('./events/afk-status')
const { green, what, embedcolor } = require('./colors.json')
const snip = require("./events/msg-snipe")

const client = new Commando.CommandoClient({
  owner: config.ownerId,
  commandPrefix: config.prefix,
  disableMentions: 'everyone'
})

// Saving configurations to MongoDB
client.setProvider(
  MongoClient.connect(process.env.MONGO)
    .then((client) => {
      return new MongoDBProvider(client, 'FrocklesDatabases')
    })
    .catch((err) => {
      console.error(err)
    })
)
////////////////////////////////////////////////////////

// Giveaway Stuff
const db = require('quick.db')
if (!db.get('giveaways')) db.set('giveaways', []);

const { GiveawaysManager } = require('discord-giveaways');
const GiveawayManagerWithOwnDatabase = class extends GiveawaysManager {
  async getAllGiveaways() {
    return db.get('giveaways');
  }

  async saveGiveaway(messageID, giveawayData) {
    db.push('giveaways', giveawayData);
    return true;
  }

  async editGiveaway(messageID, giveawayData) {
    const giveaways = db.get('giveaways');
    const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageID !== messageID);
    newGiveawaysArray.push(giveawayData);
    db.set('giveaways', newGiveawaysArray);
    return true;
  }

  async deleteGiveaway(messageID) {
    const newGiveawaysArray = db.get('giveaways').filter((giveaway) => giveaway.messageID !== messageID);
    db.set('giveaways', newGiveawaysArray);
    return true;
  }
}

const manager = new GiveawayManagerWithOwnDatabase(client, {
  storage: false,
  updateCountdownEvery: 10000,
  endedGiveawaysLifetime: 604800000,
  default: {
    botsCanWin: false,
    embedColor: "#DD2E44",
    embedColorEnd: embedcolor,
    reaction: "🎉"
  }
})

client.giveawaysManager = manager
////////////////////////////////////////////////////////

client.on('messageDelete', async message => {
  const args = message.content.split(" ")
  const author = message.author.id
  const tag = message.author.tag
  const time = message.createdAt
  const icon = message.author.displayAvatarURL()
  snip.run(message, args, client, author, tag, time, icon)
})


client.on('ready', async () => {
  // Support for music playback
  client.distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true, leaveOnFinish: true, youtubeCookie: process.env.YTCOOKIE })
  //// To get your YouTube cookie
  //// - navigate to YouTube in a web browser
  //// - open up dev tools (opt+cmd+j on mac, ctrl+shift+j on windows)
  //// - go to the network tab
  //// - click on a request on the left
  //// - scroll down to "Request Headers"
  //// - find the "cookie" header and copy its entire contents
  client.distube
    .on('playSong', async (message, queue, song) => {
      queue.autoplay = false // To prevent suggested songs provided by the bot
      const playingEmbed = new Discord.MessageEmbed()
        .setColor(green)
        .setThumbnail(song.thumbnail)
        .setDescription(`
  <:scrubgreen:797476323316465676> **Now Playing:**
  [${song.name}](${song.url}) - **${song.formattedDuration}**
  `)
        .setFooter(`Requested by: ${song.user.tag}`)
        .setTimestamp()
      message.channel.send(playingEmbed)
    })
    .on('addSong', (message, queue, song) => {
      const playingEmbed = new Discord.MessageEmbed()
        .setColor(green)
        .setThumbnail(song.thumbnail)
        .setDescription(`
  <:scrubgreen:797476323316465676> **Added to the queue.**
  [${song.name}](${song.url}) - **${song.formattedDuration}**
  `)
        .setFooter(`Added by: ${song.user.tag}`)
        .setTimestamp()
      message.channel.send(playingEmbed)
    })
    .on('empty', (message) => {
      const emptyChannelEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription("<:scrubnull:797476323533783050> **VC Empty. Leaving the channel...**")
      message.channel.send(emptyChannelEmbed)
    })
    .on('finish', (message) => {
      const endQueueEmbed = new Discord.MessageEmbed()
        .setColor(what)
        .setDescription("<:scrubnull:797476323533783050> **No more songs in queue. Leaving...**")
      message.channel.send(endQueueEmbed)
    })
    .on("error", (message, err) => {
      const errorEmbed = new Discord.MessageEmbed()
        .setColor('#ff0000')
        .setTitle('(Un)expected Error Occurred.')
        .setDescription(`\`\`\`${err}\`\`\``)
      message.channel.send(errorEmbed)
    })
  ////////////////////////////////////////////////////////

  // Bot Status
  function presence() {
    let status = require('./assets/json/bot-status.json')
    let randomStatus = Math.floor(Math.random() * status.length)

    client.user.setPresence({
      status: 'online',
      activity: {
        name: status[randomStatus],
        type: 'WATCHING'
      }
    })
  }

  //// changing status varying from 30 seconds to 10 minutes
  const randomTimerStatus = Math.floor(Math.random() * 600000 + 30000)
  setInterval(presence, randomTimerStatus)
  ////////////////////////////////////////////////////////

  // Connecting to MongoDB 
  const connectToMongoDB = async () => {
    await mongo().then((mongoose) => {
      try {
        console.log('Successfully Connected To Mongo!')
      } finally {
        mongoose.connection.close()
      }
    })
  }
  connectToMongoDB()
  ////////////////////////////////////////////////////////

  client.registry
    .registerGroups([
      ['conventional', 'Conventional Commands'],
      ['moderation', 'Moderation Commands'],
      ['economy', 'Economy System'],
      ['images', 'Pictures Retrieval'],
      ['encoders', 'Message Encoders'],
      ['covid-related', 'COVID-19 Related Commands'],
      ['funs', 'Some Really Simple Fun Stuff'],
      ['soundboard', 'Soundboard!'],
      ['music-library', "Frockle's Music Library"],
      ['music', 'Music Controller'],
      ['giveaway', 'Giveaway Tools'],
      ['misc', 'Miscellaneous Stuff'],
      ['utility', 'Extra Utilities'],
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'cmds'))

  poll(client)
  chatbot(client)
  welcomeMsg(client)

  console.log("Initialized frockles (meowscrub) successfully.")
})

client.on('message', message => {
  afkStatus(client, message)
})

client.login(process.env.TOKEN)