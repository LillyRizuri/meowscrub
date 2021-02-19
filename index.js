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
const autoPublish = require('./events/auto-publish')
const chatbot = require('./events/auto-chatbot')
const welcomeMsg = require('./events/welcome-msg')
const { green, what } = require('./colors.json')
const snip = require("./events/msg-snipe")

const client = new Commando.CommandoClient({
  owner: '692346139093106738',
  commandPrefix: config.prefix,
  disableMentions: 'everyone'
})

client.setProvider(
  MongoClient.connect(process.env.MONGO)
    .then((client) => {
      return new MongoDBProvider(client, 'scrubthispie')
    })
    .catch((err) => {
      console.error(err)
    })
)

// please use discord-giveaways@4.2.1 instead
const { GiveawaysManager } = require("discord-giveaways")

const manager = new GiveawaysManager(client, {
  storage: "./giveaways.json",
  updateCountdownEvery: 10000,
  default: {
    botsCanWin: false,
    embedColor: "#FF0000",
    reaction: "🎉"
  }
})

client.giveawaysManager = manager

client.on('messageDelete', async message => {
  const args = message.content.split(" ")
  const author = message.author.id
  const tag = message.author.tag
  const time = message.createdAt
  const icon = message.author.displayAvatarURL()
  snip.run(message, args, client, author, tag, time, icon)
})

client.on('ready', async () => {
  console.log('ping pong, meowscrub is online.')
  // Support for music playback
  client.distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true, leaveOnFinish: true })
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
  // Bot Status
  function presence() {
    let status = [
      "your entire existence",
      "the spinning circle",
      "torned books",
      "you",
      "the police",
      "the void of nothingness",
      "cardboard play",
      "paint drying",
      "bass getting slapped",
      "the frog family",
      "scary stuff",
      "legos",
      "and staring at you",
      "angry people",
      "a random gameplay",
      "the TV",
      "a failed experiment",
      "a bruh moment",
      "the lonely street",
      "ink flowing",
      "the evils suffer",
      "directly into your eyes",
      "the dark sky",
      "the house of the dead",
      "police police police",
      "poggers getting deleted",
      "pesky mosquitoes",
      "my messy table",
      "for my code",
      "a washing machine",
      "the headlines",
      "the lonely box",
      "nothing apparently",
      "the sky blue",
      "indian scammers",
      "people getting canceled",
      "everything for no reason",
      "a noice moment",
      "a decent vps provider",
      "for your health",
      "code red",
      "randomness",
      "as a calculator",
      "google stealing my data",
      "discord.py's quality",
      "the dogecoin",
      "the sea",
      "the bullshit man bullshitting",
      "the chemist testing chemicals",
      "someone hiking",
      "someone turning into blue",
      "online classes",
      "vsauce i guess",
      "an old computer from nowhere",
      "neighbor's house",
      "the clock ticking"
    ]
    let randomStatus = Math.floor(Math.random() * status.length)

    client.user.setPresence({
      status: 'online',
      activity: {
        name: status[randomStatus],
        type: 'WATCHING'
      }
    })
  }
  setInterval(presence, 1800000)

  poll(client)
  autoPublish(client)
  chatbot(client)
  welcomeMsg(client)

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

  client.registry
    .registerGroups([
      ['conventional', 'Conventional Commands'],
      ['moderation', 'Moderation Commands'],
      ['utility', 'Extra Utilities'],
      ['economy', 'Economy System'],
      ['music', 'Music Controller'],
      ['soundboard', 'Soundboard!'],
      ['music-library', "Frockle's Music Library"],
      ['funs', 'Some Really Simple Fun Stuff'],
      ['images', 'Pictures Retrieval'],
      ['encoders', 'Message Encoders'],
      ['covid-related', 'COVID-19 Related Commands'],
      ['giveaway', 'Giveaway Tools']
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'cmds'))
})

client.login(process.env.TOKEN)