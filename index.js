// const Discord = require('discord.js')
// const client = new Discord.Client()
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient
const MongoDBProvider = require('commando-provider-mongo').MongoDBProvider
const path = require('path')
const Commando = require('discord.js-commando')

const config = require('./config.json')
const poll = require('./auto-poll')
const mongo = require('./mongo')
const autoPublish = require('./auto-publish')
const chatbot = require('./auto-chatbot')

const client = new Commando.CommandoClient({
  owner: '692346139093106738',
  commandPrefix: config.prefix
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

client.on('ready', async () => {
  console.log('ping pong, meowscrub is online.')
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
      "the bullshit man bullshiting",
      "the chemist testing chemicals",
      "someone hiking",
      "someone turning into blue"
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
  setInterval(presence, 30000)
  
  poll(client)
  autoPublish(client)
  chatbot(client)

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
      ['covid-related', 'COVID-19 Related Commands']
    ])
    .registerDefaults()
    .registerCommandsIn(path.join(__dirname, 'cmds'))
})

client.login(process.env.TOKEN)

const http = require('http')
const server = http.createServer((req, res) => {
  res.writeHead(200)
  res.end('ok')
});
server.listen(3000)