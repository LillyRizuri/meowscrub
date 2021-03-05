const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const settingsSchema = mongoose.Schema({
    guildId: reqString,
    chatbotChannel: reqString,
    suggestionsChannel: reqString
})

module.exports = mongoose.model('guildSettings', settingsSchema)